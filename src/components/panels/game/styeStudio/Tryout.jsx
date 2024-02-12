import { BorderedButton } from 'components/common/BorderedButton'
import { setMagicMirrorCompletion } from "store/reducers/styleStudio";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react'

export const TryOut = ({ tryoutData, active, setNextEligible }) => {
    const [currentSelectionIndex, setCurrentSectionIndex] = useState(null)
    const [mainSelection, setMainSelection] = useState(null)
    const [subSelection, setSubSelection] = useState(null)
    const [showSubSelection, setShowSubSelection] = useState(false)
    const [showLine, setShowLine] = useState(false)
    const {
        magicMirrorCompletion
    } = useSelector((state) => state.styleStudio);

    const dispatch = useDispatch()

    useEffect(() => {
        if(magicMirrorCompletion && magicMirrorCompletion[tryoutData.tryoutID] && magicMirrorCompletion[tryoutData.tryoutID].completed){
            const currIndex = tryoutData.mainSelector?.options.findIndex(option => option.avatarItem === magicMirrorCompletion[tryoutData.tryoutID].mainSelection);
            setCurrentSectionIndex(currIndex)
            setMainSelection(magicMirrorCompletion[tryoutData.tryoutID].mainSelection)
            if(magicMirrorCompletion[tryoutData.tryoutID].subSelection){
                setSubSelection(magicMirrorCompletion[tryoutData.tryoutID].subSelection)
                setShowSubSelection(true)
            }
        }else{
            setCurrentSectionIndex(null)
            setMainSelection(null)
            setSubSelection(null)
            setShowSubSelection(false)
        }
    }, [tryoutData])

    useEffect(() => {
        setTimeout(() => {
            setShowLine(active)
        }, 100);
    }, [])

    const handleConfirmSelection = () => {
        if(mainSelection && (subSelection || !tryoutData.mainSelector?.options[currentSelectionIndex].subSelector)){
            let completionData = {}
            completionData[tryoutData.tryoutID] = {
                completed : true,
                mainSelection,
                subSelection
            }
            dispatch(setMagicMirrorCompletion({
                ...completionData
            }))
            setNextEligible(true)
        }else{
            console.log("Main selection or Sub selection missing")
        }
    }

    return <div className="container">
        <div className="tutorial show">
            {
                tryoutData.content?.heading &&
                <>
                    <div className="heading">{tryoutData.content?.heading}</div>
                    <div className={`bottomLine${active ? " show" : ""}`}></div>
                </>
            }
            <div className={`scrollableContent${showLine ? " show" : ""}`}>
                {
                    tryoutData?.content &&
                    <div className="content">
                        {
                            tryoutData.content?.description?.split('\n').map(line => {
                                return <div className="description">{line}</div>
                            })
                        }
                    </div>
                }
                <div className="tryout">
                    <div className="tryoutTitle">{tryoutData.tryout?.tryoutTitle}</div>
                    {
                        tryoutData.mainSelector &&
                        <div className="categoryGroup show">
                            <div className="title">{tryoutData.mainSelector?.title}</div>
                            <div className="options">
                                {
                                    tryoutData.mainSelector?.options.map((picker, index) => {
                                        return (
                                            <div key={index} onClick={() => {
                                                if(mainSelection !== picker.avatarItem){
                                                    setTimeout(() => {
                                                        if(window.gameClient){
                                                            window.gameClient.setAvatarMakeupItem(picker.avatarItem)
                                                        }
                                                        setMainSelection(picker.avatarItem)
                                                        setShowSubSelection(true)
                                                        setCurrentSectionIndex(index)
                                                    }, 300);
                                                }else{
                                                    setMainSelection(null)
                                                    setCurrentSectionIndex(null)
                                                }
                                                setSubSelection(null)
                                                setShowSubSelection(false)
                                            }}>
                                                <Picker 
                                                    color={picker.color} 
                                                    imagePath={picker.imagePath} 
                                                    size={picker.size} 
                                                    label={picker.label} 
                                                    selected={mainSelection === picker.avatarItem}
                                                />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    }
                    {
                        tryoutData.mainSelector?.options[currentSelectionIndex]?.subSelector &&
                        <div className={`categoryGroup${showSubSelection ? " show" : ""}`}>
                            <div className="title">{tryoutData.mainSelector?.options[currentSelectionIndex].subSelector?.title}</div>
                            <div className="options">
                                {
                                    tryoutData.mainSelector?.options[currentSelectionIndex].subSelector?.options?.map((picker, index) => {
                                        return (
                                            <div key={index} onClick={() => {
                                                if(subSelection !== picker.avatarItem){
                                                    if(window.gameClient){
                                                        window.gameClient.setAvatarMakeupItem(picker.avatarItem)
                                                    }
                                                    setSubSelection(picker.avatarItem)
                                                }else{
                                                    setSubSelection(null)
                                                }
                                            }}>
                                                <Picker 
                                                    color={picker.color} 
                                                    size={picker.size} 
                                                    label={picker.label} 
                                                    selected={subSelection === picker.avatarItem}
                                                />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    }
                    { mainSelection && (!tryoutData.mainSelector?.options[currentSelectionIndex]?.subSelector || subSelection) && <BorderedButton onClick={handleConfirmSelection}>Confirm</BorderedButton>}
                </div>
            </div>
        </div>
    </div>
}

export const Picker = ({ size, color, imagePath, label, selected }) => {

    return (
        <div className={`picker ${size} `} >
            {
                color 
                    ? <div className={"color " + (selected ? "selected" : "")} style={{ background: color }}></div> 
                    : <img className={
                        selected 
                        ? "selected" 
                        : ""
                    } src={imagePath} alt="" srcset="" />
            }
            {
                label && <div className="pickerTitle">{label}</div>
            }
        </div>
    )
}