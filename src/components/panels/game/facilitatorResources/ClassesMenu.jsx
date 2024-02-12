import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import folderIcon from 'assets/images/icons/folder-icon.png'

export const ClassesMenu = ({ setStage, setCurrClass }) => {
    const [classes, setClasses] = useState([])
    const currUser = useSelector((state) => state.user.current);
    const dispatch = useDispatch();

    useEffect(() => {
        //Get Class Resources
        console.log("CURRENT USER", currUser)
    },[])

    const handleSelectClass = () => {
        setStage('CLASS_RESOURCES')
        setCurrClass('Test Class')
    }

    return (
        <Fragment>
            <div className='class-menu'>
                <div onClick={handleSelectClass} className='class-card'>
                    <img src={folderIcon} alt='class_placeholder' className='class-icon' />
                    <div className='class-name'>
                        Test Class
                    </div>
                </div>
            </div>
        </Fragment>
    );
};