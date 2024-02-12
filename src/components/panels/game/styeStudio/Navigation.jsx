import { Icon } from "@fluentui/react"

export const Navigation = ({ handleNextClick, handleBackClick, handleDismiss, isFirst, isLast, isNextDisabled, setOnPodium, onPodium }) => {
    return <div className="studioNav">
        <div className="controls">
            {(!isFirst || onPodium) 
                && <div 
                        className="back control" 
                        style={{cursor: "pointer"}} 
                        onClick={() => {
                            if(onPodium){
                                setOnPodium(false)
                            }else{
                                handleBackClick()
                            }
                        }}
                    >
                        <Icon iconName="ChromeBack" className="icon" />
                        <div className="text">Back</div>
                    </div>
            }
            {(!isLast && !onPodium)
                && <div 
                        className={"next control " + (isNextDisabled ? "disabled" : "")} 
                        style={{cursor: "pointer"}} onClick={() => {
                            if(!isNextDisabled){
                                handleNextClick()
                            }
                        }}>
                        <div className="text">
                            Next
                        </div>
                        <Icon iconName="ChromeBackMirrored" className="icon" />
                    </div>
            }
        </div>
        <div 
            className="close" 
            style={{cursor: "pointer"}} 
            onClick={handleDismiss}
        >
            <Icon iconName="cancel" />
        </div>
    </div>
}