function getAttribute(presentation, key) {
    return presentation?.attributes?.['org.iso.18013.5.1']?.[key]
}

/*
 other attributes:
    issue_date
    portrait
    issuing_country
    issuing_authority
    portrait
    driving_privileges
    un_distinguishing_sign
    sex
    height
    weight
    eye_colour
    hair_colour
    resident_address
    resident_city
    resident_state
    resident_postal_code
    resident_country
    issuing_jurisdiction
 */
export const MdlCard = (presentation) =>
    <div>
        <p> Name: {getAttribute(presentation, 'given_name')} {getAttribute(presentation, 'family_name')}</p>
        <p> Date of Birth: {getAttribute(presentation, 'birth_date')}</p>
        <p> Expirty day: {getAttribute(presentation, 'expiry_date')}</p>
        <p> Driving Licence: {getAttribute(presentation, 'document_number')}</p>
    </div>;
