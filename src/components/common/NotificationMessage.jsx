import { MessageBar } from "@fluentui/react";
import { BorderedButton } from "./BorderedButton";

export const NotificationMessage = ({ messageBarType, isMultiline, show, message, buttons, heading, id, onDismiss, dismissButtonAriaLabel }) => {

    return (
        <MessageBar
            messageBarType={messageBarType}
            isMultiline={isMultiline}
            className={`messageBar msg-${id} ${show ? "" : " hide"}`}
            id={id}
            onDismiss={onDismiss}
            dismissButtonAriaLabel={dismissButtonAriaLabel}
        >
            <div className="message">
                <div className="heading">{heading}</div>
                <div className="desc">{message}</div>
            </div>
            <div className="buttons">
                {
                    buttons?.map((button) => {
                        return (
                            button.type === "primary" ?
                                <BorderedButton onClick={button.action}>{button.text}</BorderedButton> :
                                button.type === "active" ?
                                    <BorderedButton onClick={button.action} active={true}>{button.text}</BorderedButton> :
                                    <BorderedButton onClick={button.action} red={true}>{button.text}</BorderedButton>
                        )
                    })
                }
            </div>
        </MessageBar>
    )
}