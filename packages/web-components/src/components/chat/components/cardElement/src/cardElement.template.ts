/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import ArrowRight16 from '@carbon/icons/es/arrow--right/16.js';
import PlayFilledAlt16 from '@carbon/icons/es/play--filled/16.js';
import PauseFilled16 from '@carbon/icons/es/pause--filled/16.js';
import VolumeMute16 from '@carbon/icons/es/volume--mute/16.js';
import '@carbon/web-components/es/components/button/index.js';

import mp324 from '@carbon/icons/es/MP3/24.js';
import mp424 from '@carbon/icons/es/MP4/24.js';
import png24 from '@carbon/icons/es/PNG/24.js';
import pdf24 from '@carbon/icons/es/PDF/24.js';
import ppt24 from '@carbon/icons/es/PPT/24.js';
import svg24 from '@carbon/icons/es/SVG/24.js';
import xls24 from '@carbon/icons/es/XLS/24.js';
import zip24 from '@carbon/icons/es/ZIP/24.js';
import wmv24 from '@carbon/icons/es/WMV/24.js';
import txt24 from '@carbon/icons/es/TXT/24.js';
import tsv24 from '@carbon/icons/es/TSV/24.js';
import mov24 from '@carbon/icons/es/MOV/24.js';
import jpg24 from '@carbon/icons/es/JPG/24.js';
import gif24 from '@carbon/icons/es/GIF/24.js';
import csv24 from '@carbon/icons/es/CSV/24.js';
import videoPlayer24 from '@carbon/icons/es/video-player/24.js';
import documentBlank24 from '@carbon/icons/es/document--blank/24.js';
import music24 from '@carbon/icons/es/music/24.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function cardElementTemplate(customElementClass) {
  const {
    _cardData: cardData,
    type: type,
    content: content,
    fileType,
    _toggleAudio: toggleAudio,
    _isAudioPlaying: isAudioPlaying,
    _audioProgress: audioProgress,
    _audioDuration: audioDuration,
    _updateAudioDuration: updateAudioDuration,
    _updateAudioProgress: updateAudioProgress,
    _formatAudioTime: formatAudioTime,
  } = customElementClass;
  return html`<div class="${clabsPrefix}--chat-card-container">
    <div class="${clabsPrefix}--chat-card-main-content">
      ${cardData
        ? html` ${cardData.imageUrl && type === 'url'
              ? html` <div class="${clabsPrefix}--chat-card-image-container">
                  <img
                    class="${clabsPrefix}--chat-card-image"
                    src="${cardData.imageUrl}" />
                </div>`
              : type === 'video'
              ? html` <div class="${clabsPrefix}--chat-card-video-container">
                  <video controls>
                    <source src="${content}" type="video/webm" />
                  </video>
                </div>`
              : html``}

            <div
              class="${clabsPrefix}--chat-card-detail-container${type ===
              'video'
                ? '-video'
                : ''}">
              ${fileType && type === 'file'
                ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${fileType === 'mp3'
                      ? html`${iconLoader(mp324())}`
                      : fileType === 'mp4'
                      ? html`${iconLoader(mp424())}`
                      : fileType === 'png'
                      ? html`${iconLoader(png24())}`
                      : fileType === 'pdf'
                      ? html`${iconLoader(pdf24())}`
                      : fileType === 'ppt'
                      ? html`${iconLoader(ppt24())}`
                      : fileType === 'svg'
                      ? html`${iconLoader(svg24())}`
                      : fileType === 'xls'
                      ? html`${iconLoader(xls24())}`
                      : fileType === 'zip'
                      ? html`${iconLoader(zip24())}`
                      : fileType === 'wmv'
                      ? html`${iconLoader(wmv24())}`
                      : fileType === 'txt'
                      ? html`${iconLoader(txt24())}`
                      : fileType === 'tsv'
                      ? html`${iconLoader(tsv24())}`
                      : fileType === 'mov'
                      ? html`${iconLoader(mov24())}`
                      : fileType === 'jpg'
                      ? html`${iconLoader(jpg24())}`
                      : fileType === 'gif'
                      ? html`${iconLoader(gif24())}`
                      : fileType === 'csv'
                      ? html`${iconLoader(csv24())}`
                      : html`${iconLoader(documentBlank24())}`}
                  </div>`
                : html``}
              ${type === 'video'
                ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${iconLoader(videoPlayer24())}
                  </div>`
                : html``}
              ${fileType && type === 'audio'
                ? html`
                    ${fileType !== 'unknown'
                      ? html` <div
                          class="${clabsPrefix}--chat-card-detail-side-icon">
                          ${fileType === 'mp3'
                            ? html`${iconLoader(mp324())}`
                            : fileType === 'wmv'
                            ? html`${iconLoader(wmv24())}`
                            : html`${iconLoader(music24())}`}
                        </div>`
                      : html``}
                  `
                : html``}

              <div
                class="${clabsPrefix}--chat-card-detail-side-content${type ===
                'video'
                  ? '-video'
                  : ''}">
                <div class="${clabsPrefix}--chat-card-detail-title">
                  ${cardData.title}
                </div>

                <div class="${clabsPrefix}--chat-card-detail-description">
                  ${cardData.description ? cardData.description : ''}
                </div>
                ${type !== 'audio'
                  ? html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-link-container">
                        <a
                          class="${clabsPrefix}--chat-card-detail-link"
                          href="${cardData.link}"
                          target="_blank"
                          >${cardData.shortenedUrl}</a
                        >

                        <div class="${clabsPrefix}--chat-card-detail-link-icon">
                          <a href="${cardData.link}" target="_blank">
                            ${iconLoader(ArrowRight16())}
                          </a>
                        </div>
                      </div>
                    `
                  : html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-audio-container">
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-item">
                          ${isAudioPlaying
                            ? html` <cds-button
                                aria-label="Pause Audio File"
                                role="button"
                                kind="ghost"
                                size="sm"
                                @click="${toggleAudio}">
                                ${iconLoader(PauseFilled16, { slot: 'icon' })}
                              </cds-button>`
                            : html` <cds-button
                                kind="ghost"
                                aria-label="Play Audio File"
                                role="button"
                                size="sm"
                                @click="${toggleAudio}">
                                ${iconLoader(PlayFilledAlt16, { slot: 'icon' })}
                              </cds-button>`}
                        </div>
                        <!-- <div class="${clabsPrefix}--chat-card-detail-audio-item">
                <cds-button aria-label="Mute Audio" role="button" kind="ghost" size="sm" disabled>
                  ${iconLoader(VolumeMute16, { slot: 'icon' })}
                </cds-button>
                </div>-->
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-progress-bar">
                          <div
                            class="${clabsPrefix}--chat-card-detail-audio-progress">
                            &nbsp;
                          </div>
                        </div>
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-timer">
                          ${formatAudioTime(audioProgress)}/${formatAudioTime(
                            audioDuration
                          )}
                        </div>
                      </div>
                      <audio
                        id="audio"
                        src="${cardData.link}"
                        @timeupdate="${updateAudioProgress}"
                        @loadedmetadata="${updateAudioDuration}"></audio>
                    `}
              </div>
            </div>`
        : html`${type === 'url'
              ? html` <div
                  class="${clabsPrefix}--chat-card-image-container"></div>`
              : type === 'video'
              ? html` <div
                  class="${clabsPrefix}--chat-card-video-container"></div>`
              : html``}

            <div
              class="${clabsPrefix}--chat-card-detail-container${type ===
              'video'
                ? '-video'
                : ''}">
              ${type === 'file'
                ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${iconLoader(documentBlank24())}
                  </div>`
                : html``}
              ${type === 'video'
                ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${iconLoader(videoPlayer24())}
                  </div>`
                : html``}
              ${type === 'audio'
                ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${iconLoader(music24())}
                  </div>`
                : html``}

              <div
                class="${clabsPrefix}--chat-card-detail-side-content${type ===
                'video'
                  ? '-video'
                  : ''}">
                <div class="${clabsPrefix}--chat-card-detail-title">&nbsp;</div>

                <div class="${clabsPrefix}--chat-card-detail-description">
                  &nbsp;
                </div>
                ${type !== 'audio'
                  ? html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-link-container">
                        <div
                          class="${clabsPrefix}--chat-card-detail-link-icon"></div>
                      </div>
                    `
                  : html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-audio-container">
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-item">
                          ${isAudioPlaying
                            ? html` <cds-button
                                aria-label="Pause Audio"
                                role="button"
                                kind="ghost"
                                disabled
                                size="sm">
                                ${iconLoader(PauseFilled16, { slot: 'icon' })}
                              </cds-button>`
                            : html` <cds-button
                                aria-label="Start Audio"
                                role="button"
                                kind="ghost"
                                disabled
                                size="sm">
                                ${iconLoader(PlayFilledAlt16, { slot: 'icon' })}
                              </cds-button>`}
                        </div>
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-progress-bar">
                          <div
                            class="${clabsPrefix}--chat-card-detail-audio-progress">
                            &nbsp;
                          </div>
                        </div>
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-timer">
                          00:00/00:00
                        </div>
                      </div>
                    `}
              </div>
            </div>`}
    </div>
  </div>`;
}
