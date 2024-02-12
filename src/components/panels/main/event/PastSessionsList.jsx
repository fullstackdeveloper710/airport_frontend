import { useEffect, useState } from "react"
import { EventItem } from "./EventItem"
import { Dropdown, Text, TextField } from "@fluentui/react";
import { TextInput } from "components/common";
import { useDispatch, useSelector } from 'react-redux';
import { setEventPanelSectionStack } from 'store/reducers/panel';

export const PastSessionsList = (props) => {
    const room1 = [
        { key: 'room1', text: 'Room 1' },
        { key: 'room2', text: 'Room 2' },
        { key: 'room3', text: 'Room 3' }
    ];
    const sortbyDate = [
        { text: 'Date old - new', key: 'old-new' },
        { text: 'Date new - old', key: 'new-old' }
    ];
    const sortbySession = [
        { text: 'Session A - Z', key: 'a-z' },
        { text: 'Session Z - A', key: 'z-a' }
    ];
    const iconProps = { iconName: 'Search' };
    const { panel } = useSelector(
        (state) => state
    );
    const dispatch = useDispatch();
    const agenda = [
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        },
        {
            attendees: [{
                status: "",
                user: "f0afb9c0-4029-11ed-8753-0a58a9feac02"
            }, {
                status: "",
                user: "7ec0b936-d4f9-11ec-a42b-061715a54d47"
            }, {
                status: "",
                user: "33a728ca-483b-11ee-9c8e-064d6498ef33"
            }],
            createdBy: {
                id: '33a728ca-483b-11ee-9c8e-064d6498ef33',
                email: 'sainam7740@gmail.com',
                customerUsername: '',
                lastName: 'Satam',
                nickName: ''
            },
            endTime: "2023-10-31T09:27:01+00:00",
            eventLevelName: "A380",
            id: "41881d38-5ab4-11ee-953a-0a58a9feac02",
            isPrivate: false,
            location: "A380",
            notificationSid: "",
            notified: false,
            startTime: "2023-10-31T08:27:01+00:00",
            title: "First Private Session",
            updatedAt: "2023-09-24T08:27:53+00:00"
        }]
    const [activeItem, SetActiveItem] = useState(null);
    useEffect(() => {
        setTimeout(() => {
            document.getElementById('event-pastSessions')?.classList.add('show')
        }, 300)
    }, [])
    const stopPropagation = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };


    const handleSectionChange = (section) => {
        document.getElementById('event-pastSessions')?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, section]))
        }, 300);
    }

    return (
        <div className="panelContainer pastSessions" id="event-pastSessions">
            <div className="heading">
                <div className="header">Sessions > Past sessions</div>
                <div className="subHeading">

                    <div className="dropdownContainer">
                        <TextField label="Search" placeholder="Type here..." iconProps={{ iconName: "Search" }} />
                    </div>
                    <div className="dropdownContainer">
                        <Dropdown
                            onChange={console.log("Here")}
                            options={sortbySession}
                            defaultSelectedKey="room1"
                            placeholder="Select sort"
                            label="Sort by session"
                        />
                    </div>
                    <div className="dropdownContainer">
                        <Dropdown
                            onChange={console.log("Here")}
                            options={sortbyDate}
                            defaultSelectedKey="room1"
                            placeholder="Select sort"
                            label="Sort by date"
                        />
                    </div>
                </div>
            </div>
            <div className="content eventList">
                {
                    agenda?.map((item, index) => {
                        return (
                            <EventItem
                                setData={props.setData}
                                data={item}
                                key={index}
                                pastSession={true}
                                handleSectionChange={() => {
                                    handleSectionChange('pastSessionDetail')
                                }}
                            />
                        )
                    })}
            </div>
        </div>
    )
}