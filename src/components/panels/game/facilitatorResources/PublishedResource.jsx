import React, { Fragment, useState, useEffect } from 'react';
// import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

export const PublishedResource = ({ selectedResourceLink, selectedResourceType }) => {
    const [docs, setDocs] = useState([])

    useEffect(() => {
        let docArray = []
        docArray.push({
            uri : selectedResourceLink,
            fileType : selectedResourceType
        })
        setDocs(docArray)
    },[])

    return (
        <Fragment>
            <div className='published-resource'>
                {/* <DocViewer documents={docs} pluginRenderers={DocViewerRenderers}/> */}
            </div>
        </Fragment>
    );
};