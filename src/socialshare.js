/*!
 * Project Name: SocialShare
 * Author: Stephen Neate
 * License: MIT License
 * Copyright (c) 2023 Subtle Difference https://subtledifference.com.au
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

    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', e => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const social = icon.classList[1]; // get the second class name (e.g. facebook, twitter, linkedin, sms)
            const handle = icon.dataset.ssHandle; // get the value of the data-ss-handle attribute
            let shareUrl = '';
            if (social === 'sms') {
                shareUrl = `sms:?&body=${url}`;
                window.location.href = shareUrl;
            } else {
                shareUrl = getShareUrl(social, url, handle); // pass handle to getShareUrl function
                window.open(shareUrl, '_blank');
            }
        });
    });

    function getShareUrl(social, url, handle) {
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
            default:
                shareUrl = url;
        }
        return shareUrl;
    }
    
