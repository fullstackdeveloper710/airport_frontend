import React, { useState } from "react";
import { Polls } from "./Polls";
import { QuizResults } from "./QuizResults";

export const PollsMain = ({ dismissPanel, section }) => {
    // const [section, setSection] = useState('quizDetails')
    return (
        <>
            {
                section ?
                    <>
                        {
                            section === "quizResults" ?
                                <>
                                    <QuizResults dismissPanel={dismissPanel} />
                                </> :
                                <>
                                    {
                                        <Polls
                                            dismissPanel={dismissPanel}
                                            type={section}
                                        />
                                    }
                                </>
                        }
                    </> : <></>
            }
        </>
    )
}