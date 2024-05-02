import { AnimatePresence, motion } from 'framer-motion'

function getAttribute(presentation, key) {
    console.log(presentation)
    return presentation?.vc?.credentialSubject?.[key]
}

export const VpCard = (presentation) => (
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
                        Condition
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'condition')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Diagnosis Date
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'diagnosisDate')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Licensing Authority
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'licensingAuthority')}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Medical Provider Name
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'medicalProviderName')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Medical Provider License Number
                    </span>
                    <span className="text-sm">
                        {getAttribute(
                            presentation,
                            'medicalProviderLicenceNumber'
                        )}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#046B99 text-xs uppercase">
                        Medical Provider License Type
                    </span>
                    <span className="text-sm">
                        {getAttribute(
                            presentation,
                            'medicalProviderLicenceType'
                        )}
                    </span>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
)
