import React from "react"
import { BorderedButton } from "components/common/BorderedButton"
import { LandingTemplate } from "../welcome/LandingTemplate"
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from 'react-router';
import { useAuth } from "hooks/useAuth";
import { logout } from "store/reducers/user";
import { UserService } from "services";
import { setUserData } from "store/reducers/user";

const userService = new UserService()

export default () => {

    const user = useSelector((state) => state.user);
    const history = useHistory();
    const dispatch = useDispatch();
    const { keycloakLogout } = useAuth();

    const headingText = "Privacy policy"
    const descriptionText = "Lorem Ipsum is of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passage Lorem Ipsum is of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passage Lorem Ipsum is of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passage"

    const handleGoToLegalStatus = async () => {
        try{
            const privacyStatusRes = await userService.updateXPUserConsentStatus('privacyStatus',user?.current?.id)
            if(privacyStatusRes?.acceptedStatusForPrivacyPolicy){
                const userConsentStatus = {...user?.current?.consentStatus, privacyStatus: privacyStatusRes?.acceptedStatusForPrivacyPolicy}
                dispatch(setUserData({
                    ...user?.current,
                    consentStatus: userConsentStatus
                }))
                history.push('/legal');
            }else{
                console.log("UPDATE CONSENT STATUS FAILED")
            }
        }catch(error){
            console.log("UPDATE CONSENT STATUS ERROR:", error)
        }
    }

    const handleLogout = () => {
        dispatch(logout());
        keycloakLogout();
    }

    return (
        <LandingTemplate
            heading={headingText}
            description={descriptionText}
        >
            <BorderedButton onClick={handleLogout}>Back To Login</BorderedButton>
            <BorderedButton onClick={handleGoToLegalStatus}>Acknowledge</BorderedButton>
        </LandingTemplate>
    )
}