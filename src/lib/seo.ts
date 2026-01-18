import type {
    WithContext,
    LocalBusiness,
    AggregateRating,
    BreadcrumbList,
    ListItem,
    FAQPage,
    Question,
    Answer
} from "schema-dts";

/**
 * Calcula el AggregateRating basado en una lista de testimonios
 */
export function getAggregateRating(testimonials: any[]): AggregateRating | undefined {
    if (!testimonials || testimonials.length === 0) return undefined;

    const count = testimonials.length;
    const totalRating = testimonials.reduce((acc, t) => acc + (t.data?.rating || t.rating || 5), 0);
    const average = (totalRating / count).toFixed(1);

    return {
        "@type": "AggregateRating",
        ratingValue: average,
        reviewCount: count,
        bestRating: "5",
        worstRating: "1"
    };
}

/**
 * Genera el FAQ Schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]): WithContext<FAQPage> | null {
    if (!faqs || faqs.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => {
            // Fix: Google Rich Snippets no soportan Markdown, convertir a HTML básico
            const htmlAnswer = faq.answer
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Negritas
                .replace(/\n/g, "<br>"); // Saltos de línea

            return {
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: htmlAnswer
                }
            };
        })
    };
}

/**
 * Genera el BreadcrumbList Schema
 */
export function generateBreadcrumbsList(items: { name: string; item?: string }[]): WithContext<BreadcrumbList> {
    const itemListElement: ListItem[] = items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item // URL completa
    }));

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement
    };
}

interface LocalBusinessSettings {
    siteName?: string;
    phone?: string;
    city?: string;
    address?: string;
    coordinates?: { lat?: string; lng?: string };
    image?: string;
    priceRange?: string;
    businessType?: string;
    description?: string;
    areaServed?: any;
    serviceRadius?: number;
    openingHours?: any[];
    paymentAccepted?: string[];
    knowsAbout?: string[];
    slogan?: string;
    isSAB?: boolean;
    foundingDate?: string;
    siteUrl?: string;
    socialProfiles?: { facebook?: string; instagram?: string };
}

/**
 * Helper para formatear areaServed correctamente (City list o GeoCircle)
 */
export function formatAreaServed(areaData: any, radius?: number, coordinates?: { lat?: string; lng?: string }) {
    // Opción A: Si hay una lista explícita, priorizarla (Mejor SEO semántico)
    if (areaData && Array.isArray(areaData) && areaData.length > 0) {
        return areaData.map(item => {
            if (typeof item === 'string') {
                return {
                    "@type": "AdministrativeArea",
                    name: item
                };
            }
            return item;
        }) as any;
    }

    // Opción B: Si hay un radio definido y coordenadas, usar GeoCircle (Automatización)
    if (radius && radius > 0 && coordinates?.lat && coordinates?.lng) {
        return {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": parseFloat(coordinates.lat),
                "longitude": parseFloat(coordinates.lng)
            },
            "geoRadius": (radius * 1000).toString() // Convertir km a metros
        };
    }

    // Opción C: Si es un objeto individual (fallback)
    return areaData;
}

/**
 * Helper para expandir rangos de días (Mo-Fr → Mo,Tu,We,Th,Fr)
 */
function expandDayRange(dayStr: string): string {
    const dayMap: Record<string, number> = {
        'Mo': 0, 'Tu': 1, 'We': 2, 'Th': 3, 'Fr': 4, 'Sa': 5, 'Su': 6
    };
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Si contiene un rango (Mo-Fr)
    if (dayStr.includes('-')) {
        const [start, end] = dayStr.split('-');
        const startIdx = dayMap[start];
        const endIdx = dayMap[end];
        if (startIdx !== undefined && endIdx !== undefined) {
            const days: string[] = [];
            for (let i = startIdx; i <= endIdx; i++) {
                days.push(dayNames[i]);
            }
            return days.join(',');
        }
    }
    return dayStr;
}

/**
 * Genera el esquema LocalBusiness mejorado
 */
export function generateLocalBusinessSchema(
    settings: LocalBusinessSettings,
    testimonials: any[] = [],
    url: string
): WithContext<LocalBusiness> {
    const aggregateRating = getAggregateRating(testimonials);
    const baseUrl = settings.siteUrl || 'https://quitargotelebarcelona.es';

    const schema: any = {
        "@context": "https://schema.org",
        "@type": ["HomeAndConstructionBusiness", (settings.businessType || "HousePainter")],
        name: settings.siteName || "Negocio Local",
        image: settings.image?.startsWith("@assets")
            ? `${baseUrl}/images/logo.png`
            : settings.image || `${baseUrl}/images/logo.png`,
        telephone: settings.phone,
        url: url,
        description: settings.description,
        // Eliminar address completamente si es SAB (Service Area Business)
        ...(!settings.isSAB ? {
            address: {
                "@type": "PostalAddress",
                addressLocality: settings.city || "",
                addressRegion: settings.city || "",
                addressCountry: "ES",
                ...(settings.address && settings.address !== settings.city ? { streetAddress: settings.address } : {})
            }
        } : {}),
        priceRange: settings.priceRange || "€",
        currenciesAccepted: "EUR",
    };

    if (settings.slogan) {
        schema.slogan = settings.slogan;
    }

    // Año de fundación
    if (settings.foundingDate) {
        schema.foundingDate = settings.foundingDate;
    }

    if (settings.paymentAccepted && settings.paymentAccepted.length > 0) {
        schema.paymentAccepted = settings.paymentAccepted.join(", ");
    }

    if (settings.openingHours && settings.openingHours.length > 0) {
        // Formato Schema.org correcto: expandir rangos de días
        schema.openingHours = settings.openingHours.map(h => {
            const days = Array.isArray(h.dayOfWeek)
                ? h.dayOfWeek.map((d: string) => expandDayRange(d)).join(',')
                : expandDayRange(h.dayOfWeek);
            return `${days} ${h.opens}-${h.closes}`;
        });
    }

    // Campo para relevancia semántica
    if (settings.knowsAbout && settings.knowsAbout.length > 0) {
        schema.knowsAbout = settings.knowsAbout;
    }

    // Rating agregado de testimonios
    if (aggregateRating && testimonials.length >= 1) {
        schema.aggregateRating = aggregateRating;
    }

    if (settings.coordinates?.lat && settings.coordinates?.lng) {
        schema.geo = {
            "@type": "GeoCoordinates",
            latitude: settings.coordinates.lat,
            longitude: settings.coordinates.lng
        };
    }

    // Lógica mejorada para areaServed
    if (settings.areaServed || settings.serviceRadius) {
        schema.areaServed = formatAreaServed(
            settings.areaServed,
            settings.serviceRadius,
            settings.coordinates
        );
    }

    // Perfiles sociales para E-E-A-T
    const sameAs: string[] = [];
    if (settings.socialProfiles?.facebook && settings.socialProfiles.facebook !== 'https://facebook.com') {
        sameAs.push(settings.socialProfiles.facebook);
    }
    if (settings.socialProfiles?.instagram && settings.socialProfiles.instagram !== 'https://instagram.com') {
        sameAs.push(settings.socialProfiles.instagram);
    }
    if (sameAs.length > 0) {
        schema.sameAs = sameAs;
    }

    return schema;
}
