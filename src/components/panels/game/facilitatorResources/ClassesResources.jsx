import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import pptIcon from 'assets/images/icons/ppt-icon.png'
import pdfIcon from 'assets/images/icons/pdf-icon.png'

export const ClassesResources = ({ setStage, currClass, setCurrPublishedResourceLink, setCurrPublishedResourceType }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        //Get Class Resources
        console.log("CURRENT USER", currClass)
    },[])

    const handleSelectResource = (resourceId) => {
        switch(resourceId) {
            case 1 : {
                setCurrPublishedResourceLink('https://testfacilitatorbucket.s3.us-west-1.amazonaws.com/PPTWITHVIDEO.pptx')
                setCurrPublishedResourceType('pptx')
                break;
            }
            case 2 : {
                setCurrPublishedResourceLink('https://testfacilitatorbucket.s3.us-west-1.amazonaws.com/Login+Flow+for+Sephoraverse.pdf')
                setCurrPublishedResourceType('pdf')
                break;
            }
            default:
                console.log("WRONG RESOURCE")
        }
        setStage("PUBLISHED_RESOURCE")
    }

    return (
        <Fragment>
            <div className='class-resources'>
                <div onClick={() => handleSelectResource(1)} className='class-resources-card'>
                    <img src={pptIcon} alt='class_placeholder' className='class-resources-icon' />
                    <div style={{marginTop: "5px"}} className='class-resources-name'>
                        Test PPT
                    </div>
                </div>
                {/* <div onClick={() => handleSelectResource(2)} className='class-resources-card'>
                    <img src={pdfIcon} alt='class_placeholder' className='class-resources-icon' />
                    <div className='class-resources-name'>
                        Test PDF
                    </div>
                </div> */}
            </div>
        </Fragment>
    );
};