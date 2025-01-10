/*!
 * Project Name: SocialShare
 * Author: Stephen Neate
 * License: MIT License
 * Copyright (c) 2023 Subtle Difference https://github.com/SubtleDifference/SocialShare
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

document.addEventListener('DOMContentLoaded', () => {
    const socialIcons = document.querySelectorAll('.social-icons a');

    socialIcons.forEach(icon => {
        icon.addEventListener('click', e => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const social = icon.className;
            const handle = icon.dataset.ssHandle;
            const text = encodeURIComponent(icon.dataset.ssText);

            let shareUrl = '';
            if (social === 'sms') {
                shareUrl = `sms:?&body=${url}`;
                window.location.href = shareUrl;
            } else if(social === 'facebook' || social === 'linkedin'){
                shareUrl = getShareUrl(social, url, handle, text);
                let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=800,left=100,top=100`;
                open(shareUrl, 'Facebook', params);
            } else {
                shareUrl = getShareUrl(social, url, handle, text);
                if(shareUrl!= null){
                    window.open(shareUrl, '_blank');
                }
            }
        });
    });
});

function getShareUrl(social, url, handle, text) {
    let shareUrl = '';
    switch (social) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
            if (handle) {
                shareUrl += `&via=${handle}`;
            }
            if (text) {
                shareUrl += `&text=${text}`;
            }
            break;
        case 'bluesky':
            shareUrl = `https://bsky.app/intent/compose?text=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/shareArticle?url=${url}`;
            break;
        case 'email':
            shareUrl = `mailto:?body=${url}`;
            break;
        case 'sms':
            shareUrl = `sms:?&body=${url}`;
            break;
        case 'reddit':
            shareUrl = `https://www.reddit.com/submit?url=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${url}`;
            break;
        case 'pinterest':
            shareUrl = `https://www.pinterest.com/pin/create/button/?url=${url}`;
            break;
        case 'mastodon':
            shareUrl = `https://mastodon.social/share?url=${url}`;
            break;
        case 'copy':
            const input = document.createElement('input');
            input.setAttribute('value', decodeURIComponent(url));
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('Copied the URL to your clipboard');
            shareUrl = null;
            break;
        case 'blogger':
            shareUrl = `https://www.blogger.com/blog-this.g?url=${url}`;
            break;
        case 'digg':
            shareUrl = `https://digg.com/submit?url=${url}`;
            break;
        case 'evernote':
            shareUrl = `https://www.evernote.com/clip.action?url=${url}`;
            break;
        case 'flipboard':
            shareUrl = `https://share.flipboard.com/bookmarklet/popout?v=2&url=${url}`;
            break;
        case 'messenger':
            shareUrl = `fb-messenger://share/?link=${encodeURIComponent(url)}`;
            break;
        case 'print':
            window.print();
            shareUrl = null;            
            break;
        case 'tumblr':
            shareUrl = `https://www.tumblr.com/share/link?url=${url}`;
            break;
        case 'vk':
            shareUrl = `https://vk.com/share.php?url=${url}`;
            break;
        case 'rocketchat':
            const message = encodeURIComponent('Check out this link: ' + url);
            shareUrl = `https://go.rocket.chat/home?msg=${message}`;
            break;
        case 'weibo':
            shareUrl = `https://service.weibo.com/share/share.php?url=${url}`;
            break;
        case 'xing':
            shareUrl = `https://www.xing.com/app/user?op=share;url=${url}`;
            break;
        case 'printPDF':
            shareUrl = `https://www.printfriendly.com/print?url=${url}`;
            break;
        default:
            shareUrl = url;
    }
    return shareUrl;
}
