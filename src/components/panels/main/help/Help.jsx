import React, { Fragment, useMemo, useEffect } from 'react';
import Logo from 'assets/images/logo/logo-secondary.png';
import iconDashboard from 'assets/images/icons/icon-dashboard.png';
import iconChat from 'assets/images/icons/icon-chat.png';
import iconCalendar from 'assets/images/icons/icon-calendar.png';
import iconAccount from 'assets/images/icons/icon-account.png';
import iconSettings from 'assets/images/icons/icon-settings.png';
import iconHelper from 'assets/images/icons/icon-helper.png';
import iconMic from 'assets/images/icons/icon-mic.png';
import iconVideo from 'assets/images/icons/icon-video.png';
import { FontIcon } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { updatedHelpPannelContent } from 'utils/eventVariables';
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { useDispatch, useSelector } from 'react-redux';

const CollapsableContent = (props) => {
  const [selected, setSelected] = React.useState(false);

  return (
    <div
      key={`${Math.random()}`}
      onClick={() => {
        setTimeout(() => {
          setSelected(!selected);
        }, 300);
      }}
    >
      {selected ? (
        <div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <FontIcon iconName="ChevronUpSmall" />
            <h2 style={{ marginLeft: 10, cursor: 'pointer' }}>{props.title}</h2>
          </div>
          {props.children}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <FontIcon iconName="ChevronDownSmall" />
          <h2 style={{ marginLeft: 10, marginRight: 0 }}>{props.title}</h2>
        </div>
      )}
    </div>
  );
};

const renderContentItem = (content, params) => {
  if (Array.isArray(content?.anchors) && content.anchors?.length > 0) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column' }}
        key={`${params?.ky}-${Math.random()}`}
      >
        {content?.anchors?.map((anchor, index) => (
          <a
            key={params?.ky + index}
            href={anchor?.href}
            title={anchor?.title}
            target="_blank"
            rel="noreferrer"
          >
            {anchor?.aText}{' '}
          </a>
        ))}
      </div>
    );
  }

  const listItem = content?.li && renderLI(content?.li);
  const unordredList = content?.ul && Array.isArray(content.ul) && (
    <ul className={params?.ulClass} key={`${params?.ky}-${Math.random()}`}>
      {content.ul.map((item, idx) => {
        //   console.log('\n\nrenderUL maped items -> item: ', item);
        const listItemFound = item?.li && renderLI(item?.li);
        const paragraphFound = item?.p && renderParagraph(item.p);
        const subHeaderFound =
          item?.subHeader && renderSubHeader(item?.subHeader);
        const arrayFound =
          item?.ul &&
          Array.isArray(item?.ul) &&
          renderContentItem({ ul: item.ul }, { ky: params?.ky + '-' + idx });
        return (
          <Fragment key={`content-ul-${params?.ky}-${idx}-${Math.random()}`}>
            {listItemFound}
            {arrayFound}
            {paragraphFound}
            {subHeaderFound}
          </Fragment>
        );
      })}
    </ul>
  );
  const paragraph = content?.p && renderParagraph(content.p);
  const subHeader = content?.subHeader && renderSubHeader(content.subHeader);
  return (
    <Fragment key={`content- ${params?.ky}-${Math.random()}`}>
      {listItem}
      {unordredList}
      {paragraph}
      {subHeader}
    </Fragment>
  );
};

const renderLI = (listItem) => {
  if (typeof listItem === 'string') {
    return <li key={`-${Math.random()}-li`}>{listItem}</li>;
  }
  if (typeof listItem === 'object') {
    if (listItem?.src && listItem.title && listItem?.content) {
      const imageStyle = updatedHelpPannelContent
        ? { width: '40px', height: '40px' }
        : {};

      return (
        <li key={`-${Math.random()}`}>
          <img src={listItem?.src} alt={listItem.title} style={imageStyle} />
          <div className="contentWrapper">
            <span className="title">{listItem.title}</span>
            <span className="content">{listItem?.content}</span>
          </div>
        </li>
      );
    }
    if (listItem?.text && listItem?.ul) {
      return (
        <li key={`-${Math.random()}`}>
          {listItem?.text}
          {renderContentItem({ ul: listItem?.ul })}
        </li>
      );
    }
    if (
      Array.isArray(listItem) &&
      listItem !== 'string' &&
      listItem?.length > 0
    ) {
      return (
        <li key={`-${Math.random()}`}>
          {listItem?.map((i, indx) => {
            const strongText = i?.strong;
            const paragraphText = i?.p;
            return (
              <Fragment key={`${indx}-${Math.random()}`}>
                <strong>{strongText}</strong>
                {paragraphText}
              </Fragment>
            );
          })}
        </li>
      );
    }
    if (listItem.text && listItem?.emailTitle && listItem?.aTextEmailAddress) {
      return (
        <li key={`li-${Math.random()}`}>
          {listItem.text}
          <a
            href={`mailto:${listItem?.aTextEmailAddress?.indexOf('@') > -1
              ? listItem.aTextEmailAddress
              : 'hello@surrealevents.com'
              }`}
            title={listItem?.emailTitle}
          >
            {listItem?.aTextEmailAddress}
          </a>
          {'.'}
        </li>
      );
    }

    const prefixTextText = listItem?.preText;
    const italicText = listItem?.i;
    const strongText = listItem?.strong;
    const paragraphText = listItem?.text;
    const listItemText = typeof listItem?.li === 'string' && listItem.li;
    const strongText2 = listItem?.strong2;
    const rawUL = <ul>{listItem?.ul}</ul>;
    return (
      <li key={`li-${Math.random()}`}>
        {prefixTextText}
        <i>{italicText}</i>
        <strong>{strongText}</strong>
        {paragraphText}
        <strong>{strongText2}</strong>
        {listItemText}
        {rawUL}
      </li>
    );
  }
};

const renderChapterContent = (chapter, params) => {
  return chapter?.content?.length > 0
    ? chapter?.content.map((items, idx) => {
      return renderContentItem(items, {
        ulClass: params?.ulClass,
        ky: `item ${idx}-${Math.random()}`,
      });
    })
    : 'chapter seems to not have content';
};

const renderParagraph = (text) => <p style={{ margin: 'initial' }}>{text}</p>;
const renderSubHeader = (text) => (
  <h3 style={{ padding: '10px 0', marginBottom: '0' }}>{text}</h3>
);

const RenderContent = ({ content, t }) => {
  return content.map((item, index) => {
    const key = Object.keys(item)[0];
    const value = item[key];

    if (Array.isArray(value)) {
      // If the value is an array, recursively render its content
      return (
        <ul key={index}>
          {value.map((subItem, subIndex) => (
            <li key={subIndex}>
              <RenderContent content={[subItem]} t={t} />
            </li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object') {
      // If the value is an object, recursively render its content
      return <RenderContent key={index} content={[value]} t={t} />;
    } else {
      // If the value is a string, render the corresponding HTML tag
      const Tag = key.toLowerCase();
      return <Tag key={index}>{value}</Tag>;
    }
  });
};

export const Help = ({ setHelpContent, setHeaderText }) => {
  const {
    components: {
      panels: {
        main: { helpPrevious, help, helpNew },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const panel = useSelector((state) => state.panel);
  const ls = useMemo(
    () => (updatedHelpPannelContent ? helpNew : helpPrevious),
    [help]
  );

  useEffect(() => {
    setTimeout(() => {
      console.log(document.getElementById('help-list'));
      document.getElementById('help-list')?.classList.add('show');
    }, 300);
  }, []);

  const handleSectionChange = (section) => {
    document.getElementById('help-list')?.classList.remove('show');
    setTimeout(() => {
      dispatch(
        setEventPanelSectionStack([...panel.eventPanelSectionStack, section])
      );
    }, 300);
  };
  useEffect(() => {
    setTimeout(() => {
      document.getElementById('help-list')?.classList.add('show')
    }, 100)
  }, [])
  return (
    <div className="tutorialWrapper" id="help-list">
      <img src={Logo} className="logo" alt="Surreal" />
      <h1>{ls.headerText}</h1>
      <div className="groups">
        {ls.helpContent.map((group) => {
          return (
            <div className="group">
              <h1>{group.headerText.toUpperCase()}</h1>
              <div className="infos">
                {group.elements.map((element) => {
                  return (
                    <div
                      className="info"
                      onClick={() => {
                        setHelpContent(element.content);
                        setHeaderText(element.title);
                        handleSectionChange('content');
                      }}
                    >
                      {element.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* <div className="groups">
        <div className="group">
          <h1>BASIC CONTROLS</h1>
          <div className="infos">
            <div className="info">Charachter Control</div>
            <div className="info">Teleport</div>
            <div className="info">Player POV</div>
          </div>
        </div>
        <div className="group">
          <h1>SOCIAL</h1>
          <div className="infos">
            <div className="info">Interacting with other Avatars</div>
            <div className="info">Emoting</div>
          </div>
        </div>
        <div className="group">
          <h1>PRESENTING</h1>
          <div className="infos">
            <div className="info">Presenting Media</div>
          </div>
        </div>
      </div> */}
    </div>
    // <div className="tutorialWrapper">
    //   <img src={Logo} className="logo" alt="Surreal" />
    //   <h1>{ls.headerText}</h1>
    //   {ls?.helpContent?.length > 0 &&
    //     ls.helpContent.map((chapter, index) => {
    //       return (
    //         <Fragment
    //           key={`chapter-${chapter.title}-${index}-${Math.random()}`}
    //         >
    //           {chapter?.headerText && (
    //             <h1
    //               style={{
    //                 alignSelf: 'flex-start',
    //                 textAlign: 'left',
    //                 margin: '10px 0 -5px 0 ',
    //               }}
    //             >
    //               {chapter?.headerText}
    //             </h1>
    //           )}
    //           <CollapsableContent
    //             title={chapter.title}
    //             key={`collapsible-${chapter.title}-${index}-${Math.random()}`}
    //           >
    //             {renderChapterContent(chapter, {
    //               ulClass:
    //                 (updatedHelpPannelContent && index === 0) ||
    //                   (!updatedHelpPannelContent && index === 1)
    //                   ? 'navIconHelper'
    //                   : '',
    //             })}
    //           </CollapsableContent>
    //         </Fragment>
    //       );
    //     })}
    // </div>
  );
};

export const Help_Old = () => {
  return (
    <div className="tutorialWrapper">
      <img src={Logo} className="logo" alt="Surreal" />
      <h1>User guide</h1>
      <CollapsableContent title="CUSTOMIZING YOUR AVATAR">
        <ul>
          <li>
            After logging in, and selecting you video and audio settings, you
            will be prompted to customize your avatar.
          </li>
          <li>
            Use your mouse to choose your gender, then toggle through multiple
            options to tailor your avatar’s appearance—such as face, hair,
            apparel, etc.
          </li>
          <li>
            You can choose to resemble yourself, or the digital likeness you’ve
            always wanted! When you’re happy with the results, click SAVE and
            you’re ready to go.
            <ul>
              <li>
                <i>Note</i>: if you don’t save your changes, they will be lost.
              </li>
            </ul>
          </li>
        </ul>
        <p>
          Once you’re ready, click ENTER SURREAL and your avatar will land in
          the Main Hub.
        </p>
      </CollapsableContent>
      <CollapsableContent title="USING YOUR MENU BAR">
        {' '}
        <p>
          This is your go-to-place to navigate your experience in SURREAL, such
          as chat, teleport to another space or attendee, access the help desk,
          check the agenda, etc.
        </p>
        <ul className="navIconHelper">
          <li>
            <img src={iconDashboard} alt="Event Map" />
            <div className="contentWrapper">
              <span className="title">Event Map</span>
              <span className="content">
                allows you to navigate and teleport to any area.
              </span>
            </div>
          </li>
          <li>
            <img src={iconChat} alt="Global Chat" />
            <div className="contentWrapper">
              <span className="title">Global Chat</span>
              <span className="content">
                begin a 1-on-1 or a group chat with anyone in the event. This
                will enable you to locate and teleport to any participant in the
                space.
              </span>
            </div>
          </li>
          <li>
            <img src={iconCalendar} alt="Agenda" />
            <div className="contentWrapper">
              <span className="title">Agenda</span>
              <span className="content">
                locate and teleport to scheduled sessions in the event.
              </span>
            </div>
          </li>
          <li>
            <img src={iconAccount} alt="Account" />
            <div className="contentWrapper">
              <span className="title">Account</span>
              <span className="content">
                set your online status as Online, Away, Do Not Disturb, or
                Invisible.
              </span>
            </div>
          </li>
          <li>
            <img src={iconSettings} alt="Settings" />
            <div className="contentWrapper">
              <span className="title">Settings</span>
              <span className="content">
                change camera and microphone settings, as well as allow
                notifications.
              </span>
            </div>
          </li>
          <li>
            <img src={iconHelper} alt="Help Center" />
            <div className="contentWrapper">
              <span className="title">Help Center</span>
              <span className="content">
                get help navigating all aspects of the game here.
              </span>
            </div>
          </li>
          <li>
            <img src={iconMic} alt="Microphone" />
            <div className="contentWrapper">
              <span className="title">Microphone</span>
              <span className="content">
                click once to turn ON/OFF. Every time you move to a new room or
                seating area in the game you will microphone will default to
                OFF.
              </span>
            </div>
          </li>
          <li>
            <img src={iconVideo} alt="Video" />
            <div className="contentWrapper">
              <span className="title">Video</span>
              <span className="content">click once to turn ON/OFF.</span>
            </div>
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="MOVING YOUR AVATAR">
        <p>While in the space there’s a few different ways to move around:</p>
        <ul>
          <li>
            First, with the WASD keys on your keyboard.
            <ul>
              <li>
                <strong>W</strong> to move forward
              </li>
              <li>
                <strong>A</strong> to move left
              </li>
              <li>
                <strong>S</strong> to move backward
              </li>
              <li>
                <strong>D</strong> to move right
              </li>
            </ul>
          </li>
          <li>
            Second, by using your mouse to “click to move.”
            <ul>
              <li>Simply move your mouse arrow where you want to go.</li>
              <li>
                You will see an undulating blue map marker icon in its place.
              </li>
              <li>
                Click once to move and your avatar will head in that direction.
              </li>
            </ul>
          </li>
          <li>
            Third, move by teleporting.
            <ul>
              <li>
                Simply go to the left-hand menu, select the Event Map, and click
                on the button of your desired location.
              </li>
              <li>
                You can also teleport from any doorway by clicking on the
                undulating blue key icon.
              </li>
            </ul>
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="CHANGING YOUR avatar’s POV">
        {' '}
        <ul>
          <li>
            Click the “<strong>C</strong>” key to change your avatar’s
            point-of-view from third person to first person.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="TALKING TO OTHER AVATARS">
        {' '}
        <p>
          While in SURREAL, you can talk with anyone in the same room or level
          of the platform simply by unmuting your microphone. However, things to
          remember:
        </p>
        <ul>
          <li>
            <i>This is a public conversation</i>. If you want privacy, you will
            need to sit at a table or seating area.
          </li>
          <li>
            Your microphone will automatically default to MUTE if you teleport
            to another room or level.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="TETHERING / FOLLOWING ANOTHER ATTENDEE">
        <p>
          Tethering is a great way to experience SURREAL with another
          attendee—in order to follow and teleport with a co-worker or a
          colleague.
        </p>
        <ul>
          <li>
            To tether, simply move your cursor arrow over the avatar you wish to
            tether to and click the undulating person-to-person avatar.
          </li>
          <li>
            When prompted if you would like to “Follow” that participant, simply
            click “Yes.”
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="SITTING / starting a VIDEO CHAT">
        {' '}
        <ul>
          <li>
            All seating areas within SURREAL give you an opportunity to open a
            private video or audio chat with fellow participants (limited by the
            number of seats at a table or seating area).
          </li>
          <li>
            To sit, simply move your mouse arrow to the desired (unoccupied)
            seat you would like to take.
          </li>
          <li>
            You will see an undulating yellow and blue gear icon in its place.
          </li>
          <li>
            Click once and your avatar will take the seat and a video chat
            window will open up in the top right side of your browser window.
          </li>
          <li>
            You will need to activate your mic and camera after you sit down.
          </li>
          <li>
            <i>Note</i>: This is a private chat space that only the people
            sitting in the same seating area as you can hear and see the
            conversation.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Global (Text) Chat">
        {' '}
        <p>
          In addition to voice and video chat functions, SURREAL’s Global Chat
          function allows participants to conduct 1-to-1 and group text
          chatting.
        </p>
        <ul>
          <li>
            Select the Global Chat icon in the menu bar to launch the chat
            feature.
          </li>
          <li>
            For group messages, select the Channel (room or level) you would
            like to address via text. This message will be sent to every
            attendee in that level.
            <ul>
              <li>
                <i>Note</i>: This is also an ideal method for polling or
                curating post-session questions.
              </li>
              <li>
                In addition, click on the “+” create your own private group chat
                channel.
                <ul>
                  <li>Select the Channel Name.</li>
                  <li>
                    At the top of your screen, you can now select participants,
                    invite participants, or delete the chat channel.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            For Direct messages, simply click the “+” to search users by name.
            Once you locate the attendee you would like to message, simply click
            their name to open the chat window.
          </li>
          <li>
            <i>Note</i>: a red dot will appear next to the name of any attendee
            or group who has sent a new message that has been yet unread.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="TELEPORTING TO ANOTHER ATTENDEE">
        {' '}
        <p>
          Teleporting is another great way to meet up with friends and
          colleagues in SURREAL.
        </p>
        <ul>
          <li>
            To teleport to another attendee, simply click on the Chat icon in
            the menu bar.
          </li>
          <li>
            Go to “Direct messages” and select their name from the list below.
          </li>
          <li>
            Click the “Teleport” button to the right of their name.
            <ul>
              <li>
                <i>Note</i>: If you have not sent them a direct message their
                name will NOT be listed.
              </li>
              <li>
                Simply click on “+”, search for participants, select their name,
                and send them a DM.
              </li>
              <li>Now they will appear in your “Direct messages” list.</li>
            </ul>
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Using your calendar">
        {' '}
        <p>
          The calendar feature allows you to see the event agenda in real time,
          and then teleport to that session by simply clicking on the “Teleport
          to Room” button. A few things to note:
        </p>
        <ul>
          <li>Agenda items are removed after the program has completed.</li>
          <li>
            The next agenda then moves to the top of the list, with the teleport
            button below it.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Using Meeting Rooms">
        {' '}
        <p>
          There are a few simple ways to start a meeting using the Meeting Rooms
          feature:
        </p>
        <ul>
          <li>
            First, simply move your avatar to the MEETING ROOMS doorway and
            click on the undulating blue key icon to enter. A “MY MEETINGS”
            prompt will open.
            <ul>
              <li>
                Select “CREATE NEW MEETING” and chose participants from the
                dropdown list.
              </li>
              <li>
                <i>Note</i>: though you can also invite any participants to join
                as well, meetings are limited to 12 participants.
              </li>
            </ul>
          </li>
          <li>
            Second, simply click on the MEETINGS box at the bottom left of your
            screen and the “MY MEETINGS” prompt will open.
          </li>
          <li>
            Third, accept an invitation from another attendee when prompted
            under the notifications box in the top left of your screen. When
            prompted that the meeting is about to begin, simply click, join.
          </li>
        </ul>
        <p>A few things to remember:</p>
        <ul>
          <li>
            Upon entering the meeting, the platform will automatically assign
            you a seat at the table.
          </li>
          <li>Remember to turn on your video and mic.</li>
          <li>
            To exit, simply select the map icon from the menu bar and teleport
            to any other area or attendee outside the meeting room.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Emoting">
        {' '}
        <p>
          SURREAL allows avatars to express a range of whimsical actions, such
          as: say hello, nod yes or no, clap, as well as motion “over here” and
          “not sure.”
        </p>
        <ul>
          <li>
            To <i>EMOTE</i>, simply click the black box in the lower right-hand
            corner and select the emote action from the dropdown menu.
          </li>
          <li>
            Each emote will last roughly three seconds and then you can choose a
            new action.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Music">
        {' '}
        <li>
          If you wish to turn off your music in the Main Hub, simply hover your
          mouse over the speakers above the entrance to the Lounge and click the
          undulating blue music note icon.
        </li>
        <li>
          Music playing in the Lounge, General Session or Breakout Room is
          controlled by presenters.
        </li>
      </CollapsableContent>
      <CollapsableContent title="Virtual Showroom">
        {' '}
        <p>
          The virtual showroom is a fun, easy and interactive way to explore new
          products up close.
        </p>
        <ul>
          <li>
            To view showroom room scenes, simply approach any doorway in the
            showroom hall.
            <ul>
              <li>
                You will have the options between{' '}
                <strong>Kitchen, Bathroom, Bedroom, Dining</strong> and{' '}
                <strong>Exterior</strong>.
              </li>
            </ul>
          </li>
          <li>
            Upon entering the showroom portal, you will see a pop-up menu asking
            which specific style of that room scene you want to visit.
            <ul>
              <li>
                <i>Note</i>: there are multiple styles of each of the main
                categories (ex: retro kitchen and modern kitchen).
              </li>
            </ul>
          </li>
          <li>
            Once you choose your destination you will teleport into that room
            scene and can walk and view it the space in 360 degrees.
            <ul>
              <li>
                <i>Note</i>: In order to view the same exact scene with another
                participant you must be tethered to them, or teleport to them.
              </li>
            </ul>
          </li>
          <li>
            To interact with the lighting fixtures:
            <ul>
              <li>
                Face the fixture(s) you want to change and click on the
                left/right buttons.
              </li>
              <li>Proceed to change the fixtures in the area.</li>
              <li>
                Move to another part of the room to face and change the next
                fixture.
              </li>
            </ul>
          </li>
          <li>
            You can also change the lighting mood from day to night and back
            with a single click.
          </li>
          <li>
            When you click “Select” on a fixture a pop-up window will show
            finish options, price, name, ID number.
          </li>
          <li>
            <i>Note</i>: This is also where you can add this fixture to your
            cart
            <ul>
              <li>
                There is no limit on how many fixtures you can add to your cart
              </li>
              <li>
                To leave the room and go to a new room scene use your Event Map
                and choose your next destination.
              </li>
            </ul>
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Presenting / Media Play">
        <ul>
          <li>
            When entering a Breakout Room, Club Room or General Session, If you
            are an assigned presenter, you will have the choice of entering as a
            presenter or attendee.
            <ul>
              <li>PRESENTER will randomly seat your avatar onstage.</li>
              <li>ATTENDEE will randomly seat your avatar in the audience.</li>
            </ul>
          </li>
          <li>
            To present content that has been uploaded to SURREAL, simply click
            on the screen to open presenter functions.
          </li>
          <li>
            Now click on the “Present” button in the lower left-hand corner of
            your screen. This will prompt a menu item in the lower right-hand
            corner with four options:
            <ul>
              <li>
                <strong>Inactive</strong>: will display the event placeholder
                screen.
              </li>
              <li>
                <strong>Play Videos</strong>: will play any video selected (that
                has been uploaded to the player).
              </li>
              <li>
                <strong>Web Browser</strong>: will open any website you select.
              </li>
              <li>
                <strong>Google Slides</strong>: will open any slide deck (that
                has been uploaded to the player).
              </li>
            </ul>
          </li>
          <li>
            In order to play pre-loaded content, make your selection and press
            play. It will automatically play on the large screen in the room for
            all attendees to watch.
          </li>
          <li>
            Once you hit play, you can go back to “Stop Viewing” to see your
            avatar the audience while your media is playing.
          </li>
          <li>
            <i>A few important notes:</i>
            <ul>
              In the General and Breakout Sessions neither presenters nor
              attendees are able to walk around in the space. To speak to the
              audience, presenters need to unmute their microphones. To avoid
              excess room noise, audience microphones are permanently muted.
              Presenters are advised to ask audience members to use their emote
              functions (i.e. “clap”) to establish focus and attention.
            </ul>
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Moderating Questions">
        {' '}
        <ul>
          <li>Click on the Chat icon.</li>
          <li>
            Under “Channel” choose the room channel in which you wish to field
            questions.
          </li>
          <li>
            Presenters should ask audience members to post their questions to
            the chat.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Food Court">
        {' '}
        <ul>
          <li>
            Enter the food court by approaching the doorway and clicking the
            undulating blue key icon, or simply by teleporting via the map icon.
          </li>
          <li>
            Once inside you can order food through GrubHub two ways.
            <ul>
              <li>
                Approach one of the branded kiosks and click on the menu button.
              </li>
              <li>
                Approach one of the tables and click on one of the tent cards
                sitting on the table.
              </li>
            </ul>
          </li>
          <li>
            Once you click on one of these options a pop-up window will allow
            you to order directly from GrubHub just like you would in any
            browser. No need to leave SURREAL!
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="Improving your experience">
        <p>
          Because SURREAL is a pixel-streamed virtual environment, user
          experience (responsiveness, real-time rendering, latency issues, etc.)
          is improved by maximizing the strength of your internet connection. As
          such, we recommend that you:
        </p>
        <ul>
          <li>Use Google Chrome as your default browser.</li>
          <li>
            Close out of unused applications on your computer, especially heavy
            apps like Microsoft Teams, Adobe Suite, Safari and other browsers.
          </li>
          <li>
            Remember to unmute your microphone and camera anytime you sit / open
            a video chat, as well, remember to mute your mic in the main hub
            area.
          </li>
          <li>
            Close and restart your browser, then log in again, if you experience
            avatar freezing or serious latency.
          </li>
        </ul>
      </CollapsableContent>
      <CollapsableContent title="GETTING HELP">
        <p>
          Lastly, SURREAL event staff are onsite and available to help at any
          time during the event (identified in pink SURREAL-branded t-shirts).
          For additional help:
        </p>
        <ul className="mb20">
          <li>Go to the Help Desk located in the Main Hub of SURREAL.</li>
          <li>Send a direct message to “HELP” in SURREAL’s Chat feature.</li>
          <li>
            Send an email{' '}
            <a href="mailto:hello@surrealevents.com" title="Hello!">
              hello@surrealevents.com
            </a>
            .
          </li>
        </ul>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_ClickFloorToLookAround.mp4"
            title="Click Floor To Look Around"
            target="_blank"
            rel="noreferrer"
          >
            Click Floor To Look Around
          </a>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_ClickToMove.mp4"
            title="Click To Move"
            target="_blank"
            rel="noreferrer"
          >
            Click To Move
          </a>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_DragToLookAround.mp4"
            title="Drag To Look Around"
            target="_blank"
            rel="noreferrer"
          >
            Drag To Look Around
          </a>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_InteractWithObjectsByClicking..."
            title="Interact With Objects By Clicking"
            target="_blank"
            rel="noreferrer"
          >
            Interact With Objects By Clicking
          </a>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_PressCToToggleViews.mp4"
            title="Press C To Toggle Views"
            target="_blank"
            rel="noreferrer"
          >
            Press C To Toggle Views
          </a>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_TravelToNewAreas.mp4"
            title="Travel To New Areas"
            target="_blank"
            rel="noreferrer"
          >
            Travel To New Areas
          </a>
          <a
            href="https://surreal-content-storage.s3.amazonaws.com/tutorials/SR_Tutorial_WASDtoMove.mp4"
            title="WASD to Move"
            target="_blank"
            rel="noreferrer"
          >
            WASD to Move
          </a>
        </div>
      </CollapsableContent>
    </div>
  );
};
