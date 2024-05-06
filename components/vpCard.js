import { AnimatePresence, motion } from 'framer-motion'


function getAttribute(presentation, key) {
    console.log(presentation)
    return presentation?.vc?.credentialSubject?.[key]
}

export const VpCard = (presentation) => (
    <AnimatePresence>
        <motion.div className="flex flex-row gap-2">
            <div className="flex max-w-40 flex-col gap-2">
                <div className="flex flex-col">
                    <span className="text-xs uppercase text-[#046B99]">
                        Name
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'givenName')}{' '}
                        {getAttribute(presentation, 'familyName')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase text-[#046B99]">
                        Condition
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'condition')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase text-[#046B99]">
                        Diagnosis Date
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'diagnosisDate')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase text-[#046B99]">
                        Licensing Authority
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'licensingAuthority')}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                    <span className="text-xs uppercase text-[#046B99]">
                        Medical Provider Name
                    </span>
                    <span className="text-sm">
                        {getAttribute(presentation, 'medicalProviderName')}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase text-[#046B99]">
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
                    <span className="text-xs uppercase text-[#046B99]">
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
