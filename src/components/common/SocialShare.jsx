import React, { useEffect, useState, useCallback } from 'react';
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  TwitterShareButton,
  TwitterIcon,
  TelegramShareButton,
  TelegramIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TumblrShareButton,
  TumblrIcon,
  EmailShareButton,
  EmailIcon,
} from 'react-share';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import {
  shareContentTitle,
  shareContentBody,
  shareContentHashtag,
  shareContentCustomBody,
  shareLandingInEventLink,
  showCustomShareEmailBody,
} from 'utils/eventVariables';
import { useSelector } from 'react-redux';
import FileService from 'services/fileService';

const generateHTMLPage = (imageURL, title, description) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${title}</title>

    <meta name="twitter:card" content="summary_large_image">

    <meta name="twitter:title" content="${title}">
    <meta name="description" content="${description} ${shareLandingInEventLink}">
    <meta name="twitter:description" content="${description}">

    <meta name="twitter:url" content="${imageURL}">
    <meta name="twitter:image" content="${imageURL}">
    
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${title}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description} ${shareLandingInEventLink}">
    <meta property="og:url" content="${imageURL}"> 
    <meta property="og:image" content="${imageURL}">  
    <meta prefix="og: http://ogp.me/ns#" /> 
  </head>
  <body style="width: 100vw; height: 100vh; margin: 0; position:relative;">
    <img src="${imageURL}" style="width: 100%; height:100%;">
  </body>
</html>
`;
};

const spinnerStyles = {
  circle: {
    color: 'var(--sr-color-primary)',
  },
  root: {
    margin: '10px 0',
  },
};

export const SocialShare = (props) => {
  const { game } = useSelector((state) => state);

  const [shareUrl, setShareUrl] = useState(props?.shareUrl ?? '');
  const [title, setTitle] = useState(shareContentTitle);
  const [loading, setLoading] = useState(false);

  const processData = useCallback(async () => {
    if (game.screenshot) {
      try {
        setLoading(true);
        const response = await FileService.uploadBase64(
          game.screenshot.replace(/^data:image\/\w+;base64,/, ''),
          'screenshot'
        );
        const imageURL = response.url.replace(
          'dh2dge5cj9ndn.cloudfront.net',
          'share.surrealevents.com'
        );
        const html = generateHTMLPage(
          imageURL,
          shareContentTitle,
          `${shareContentBody} ${
            shareContentHashtag === '' ? '' : '#' + shareContentHashtag
          }`
        );
        var blob = new Blob([html], { type: 'text/html' });
        var fileOfBlob = new File([blob], 'screenshot.html');

        let formData = new FormData();
        formData.append('file', fileOfBlob);
        formData.append('displayName', 'screenshot');

        const res = await FileService.uploadFile(formData);

        const shareableURL = res.url.replace(
          'dh2dge5cj9ndn.cloudfront.net',
          'share.surrealevents.com'
        );
        setShareUrl(shareableURL);
        setTitle(shareContentTitle);
        // const shareData = {
        //   title: shareContentTitle,
        //   text: shareContentBody,
        //   url: shareableURL,
        // };
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [game.screenshot]);

  useEffect(() => {
    processData();
  }, [game]);

  return !loading ? (
    <div className="SocS__container">
      <div className="SocS__row">
        <div className="SocS__some-network">
          <FacebookShareButton
            url={shareUrl}
            quote={title}
            className="SocS__some-network__share-button"
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>
        </div>

        <div className="SocS__some-network">
          <FacebookMessengerShareButton
            url={shareUrl}
            appId="521270401588372"
            className="SocS__some-network__share-button"
          >
            <FacebookMessengerIcon size={32} round />
          </FacebookMessengerShareButton>
        </div>

        <div className="SocS__some-network">
          <TwitterShareButton
            url={shareUrl}
            title={title}
            className="SocS__some-network__share-button"
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </div>

        <div className="SocS__some-network">
          <TelegramShareButton
            url={shareUrl}
            title={title}
            className="SocS__some-network__share-button"
          >
            <TelegramIcon size={32} round />
          </TelegramShareButton>
        </div>
      </div>
      <div className="SocS__row">
        <div className="SocS__some-network">
          <WhatsappShareButton
            url={shareUrl}
            title={title}
            separator=": "
            className="SocS__some-network__share-button"
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>

        <div className="SocS__some-network">
          <LinkedinShareButton
            url={shareUrl}
            className="SocS__some-network__share-button"
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
        </div>

        <div className="SocS__some-network">
          <TumblrShareButton
            url={shareUrl}
            title={title}
            className="SocS__some-network__share-button"
          >
            <TumblrIcon size={32} round />
          </TumblrShareButton>
        </div>
        {showCustomShareEmailBody ? (
          navigator?.platform?.toUpperCase()?.indexOf('MAC') > -1 ||
          navigator?.platform?.toUpperCase()?.indexOf('WIN') > -1 ? (
            <div className="SocS__some-network">
              <button
                type="button"
                className="SocS__custom-email-button"
                onClick={() => {
                  openMailToExternally(title, shareContentCustomBody(shareUrl));
                }}
              >
                <EmailIcon size={32} round />
              </button>
            </div>
          ) : (
            <div className="SocS__some-network">
              <EmailShareButton
                url={shareUrl}
                subject={title}
                body={shareContentCustomBody(shareUrl)}
                className="SocS__some-network__share-button"
              >
                <EmailIcon size={32} round />
              </EmailShareButton>
            </div>
          )
        ) : (
          <div className="SocS__some-network">
            <EmailShareButton
              url={shareUrl}
              subject={title}
              body={shareContentBody}
              className="SocS__some-network__share-button"
            >
              <EmailIcon size={32} round />
            </EmailShareButton>
          </div>
        )}
      </div>
    </div>
  ) : (
    <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
  );
};

const openMailToExternally = (subject, emailBody) => {
  const theHeight = 600;
  const theWidth = 800;
  var theTop = (screen.height - theHeight) * 0.5;
  var theLeft = (screen.width - theWidth) * 0.5;
  var features = `width=800,height=600,top=${theTop},left=${theLeft},
    toolbar=0,Location=0,Directories=0,Status=0,menubar=0,Scrollbars=1,Resizable=1`;

  const windowPopup = window.open(
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      emailBody
    )}`,
    `MAIL'${subject}`.toUpperCase(),
    features
  );

  setTimeout(() => {
    if (navigator?.platform?.toUpperCase()?.indexOf('WIN') > -1) {
      windowPopup?.close?.();
    }
  }, 500);
};
