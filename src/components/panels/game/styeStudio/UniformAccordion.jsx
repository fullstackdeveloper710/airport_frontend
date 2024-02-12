import React, { useEffect, useState } from "react"
import StyleStudioAccordion from "components/common/StyleStudioAccordion";
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const UniformAccordionGroup = ({ isPodium, itemId }) => {
    const [currUniform, setCurrUniform] = useState(null)
    const {
        eventspecific: {
          emirates: { 
            style_studio: {
                uniform_guidelines:{
                    dropdowns: dropdownConfig,
                    uniform_content: {
                        try_on,
                        uniform_gallery
                    }
                }
            }
          },
        }
    } = useLabelsSchema();

    useEffect(() => {
        if(isPodium){
            setCurrUniform(try_on[itemId])
        }else{
            setCurrUniform(uniform_gallery[itemId])
        }
    }, [isPodium, itemId])

    return (    
        currUniform && (
            <>
                <div className="heading">{currUniform["title"]}</div>
                <div className="bottomLine show"></div>
                    <div className="scrollableContent show">
                        <div className="content xxl">
                            <div className="uniform-accordion-grp">
                            {
                                dropdownConfig.map((dropDown) => {
                                    return(
                                        <div key={dropDown["key"]} className="style-studio-accordion">
                                            <StyleStudioAccordion title={dropDown["title"]} content={currUniform[dropDown["key"]]} />
                                        </div>
                                    )
                                })
                            }
                        </div> 
                    </div>
                </div>
            </> 
        )
    )
}