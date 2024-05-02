import { AnimatePresence, motion } from 'framer-motion'

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
export const MdlCard = (presentation) => (
    <AnimatePresence>
        <motion.div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Name
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'given_name')}{' '}
                        {getAttribute(presentation, 'family_name')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Date of Birth:
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'birth_date')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Expiry day:
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'expiry_date')}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Driving Licence:
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'document_number')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Address:
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'resident_addres')},
                        {getAttribute(presentation, 'resident_city')},{' '}
                        {getAttribute(presentation, 'resident_state')}{' '}
                        {getAttribute(presentation, 'resident_postal_code')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Issuing Jurisdiction:
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'issuing_jurisdiction')}
                    </span>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
)
