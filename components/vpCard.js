function getAttribute(presentation, key) {
    console.log(presentation)
    return presentation?.vc?.credentialSubject?.[key]
}

export const VpCard = (presentation) =>
    <div>
        <p> Name: {getAttribute(presentation, 'givenName')} {getAttribute(presentation, 'familyName')}</p>
        <p> Condition: {getAttribute(presentation, 'condition')}</p>
        <p> Diagnosis Date: {getAttribute(presentation, 'diagnosisDate')} </p>
        <p> Medical Provider Name: {getAttribute(presentation, 'medicalProviderName')}</p>
        <p> Medical Provider Licence Number: {getAttribute(presentation, 'medicalProviderLicenceNumber')}</p>
        <p> Medical Provider Licence Type: {getAttribute(presentation, 'medicalProviderLicenceType')}</p>
        <p> LicensingAuthority: {getAttribute(presentation, 'licensingAuthority')}</p>
    </div>
