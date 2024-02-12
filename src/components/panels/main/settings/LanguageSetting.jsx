import { Icon } from "@fluentui/react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from "i18n/i18n.context";
import { useLabelsSchema } from "i18n/useLabelsSchema";
import { setEventPanelSectionStack } from 'store/reducers/panel';

export const LanguageSetting = () => {
    const { changeLocale, activeLocale } = useI18n();
    const {

        components: {
            common: { languageSelector: ls }
        },
    } = useLabelsSchema();

    const { panel } = useSelector(
        (state) => state
    );

    const dispatch = useDispatch();
    const [languages, setLanguages] = useState([
        {
            key: 'fr',
            name: "Francés",
            selected: activeLocale === "fr"
        },
        {
            key: 'en',
            name: "English",
            selected: activeLocale === "en"
        },
        {
            key: 'es',
            name: "Español",
            selected: activeLocale === "es"
        },
        {
            key: 'pt',
            name: "Português",
            selected: activeLocale === "pt"
        },
        {
            key: 'ja',
            name: "Japanese",
            selected: activeLocale === "ja"
        }
    ])
    const handleChangeLanguage = (item) => {
        window?.gameClient?.logUserAction?.({
            eventName: 'SETTINGS_LANGUAGE_CHANGED',
            eventSpecificData: null,
            beforeState: JSON.stringify(activeLocale),
            afterState: JSON.stringify(item.key),
        });
        window?.gameClient?.emitUIInteraction({
            method: 'SetLanguage',
            payload: { InLanguage: item.key === 'ja' ? 'jp' : item.key },
        });

        let langs = languages
        langs.forEach(lang => {
            lang.selected = (lang.key === item.key)
        })
        setLanguages(langs)
        changeLocale(item.key);
    };

    const handleMovingBack = () => {
        let tempStack = [...panel.eventPanelSectionStack]
        const currentPage = tempStack.pop()
        document.getElementById('profile-' + currentPage)?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack(tempStack))
        }, 300);
    }
    useEffect(() => {
        setTimeout(() => {
            document.getElementById('profile-lang')?.classList.add('show')
        }, 300)
    }, [])

    return (
        <div className="settingsContainer" id="profile-lang">
            <h1><Icon className='icon' onClick={handleMovingBack} iconName='ChromeBack' />Language</h1>

            <br />
            <label htmlFor="">{ls?.selectLanguageLabel}</label>
            <div className="languagesList">
                {
                    languages ?
                        languages.map(language => {
                            return <div className="language" onClick={() => handleChangeLanguage(language)}>{language.name}{
                                language.selected ? <Icon iconName="Accept" /> : <></>
                            }</div>
                        }) : <></>
                }
            </div>
        </div>
    )
}
