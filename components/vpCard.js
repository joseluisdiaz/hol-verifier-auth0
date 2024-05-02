function getAttribute(presentation, key) {
    console.log(presentation)
    return presentation?.vc?.credentialSubject?.[key]
}

export const VpCard = (presentation) =>
    <div>
        <p> Name: {getAttribute(presentation, 'givenName')} {getAttribute(presentation, 'familyName')}</p>
        <p> Vaccine: {getAttribute(presentation, 'vaccine')}</p>
    </div>;
