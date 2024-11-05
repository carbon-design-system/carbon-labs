/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16.js';
import PlayFilledAlt16 from '@carbon/web-components/es/icons/play--filled/16.js';
import PauseFilled16 from '@carbon/web-components/es/icons/pause--filled/16.js';
import VolumeMute16 from '@carbon/web-components/es/icons/volume--mute/16.js';
import '@carbon/web-components/es/components/button/index.js';
import mp324 from '@carbon/web-components/es/icons/MP3/24.js';
import mp424 from '@carbon/web-components/es/icons/MP4/24.js';
import png24 from '@carbon/web-components/es/icons/PNG/24.js';
import pdf24 from '@carbon/web-components/es/icons/PDF/24.js';
import ppt24 from '@carbon/web-components/es/icons/PPT/24.js';
import svg24 from '@carbon/web-components/es/icons/SVG/24.js';
import xls24 from '@carbon/web-components/es/icons/XLS/24.js';
import zip24 from '@carbon/web-components/es/icons/ZIP/24.js';
import wmv24 from '@carbon/web-components/es/icons/WMV/24.js';
import txt24 from '@carbon/web-components/es/icons/TXT/24.js';
import tsv24 from '@carbon/web-components/es/icons/TSV/24.js';
import mov24 from '@carbon/web-components/es/icons/MOV/24.js';
import jpg24 from '@carbon/web-components/es/icons/JPG/24.js';
import gif24 from '@carbon/web-components/es/icons/GIF/24.js';
import csv24 from '@carbon/web-components/es/icons/CSV/24.js';
import videoPlayer24 from '@carbon/web-components/es/icons/video-player/24.js';
import documentBlank24 from '@carbon/web-components/es/icons/document--blank/24.js';
import music24 from '@carbon/web-components/es/icons/music/24.js';
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
    _formatAudioTime: formatAudioTime
  } = customElementClass;
  return html`<div class="${clabsPrefix}--chat-card-container">
    <div class="${clabsPrefix}--chat-card-main-content">
      ${cardData ? html` ${cardData.imageUrl && type === 'url' ? html` <div class="${clabsPrefix}--chat-card-image-container">
                  <img
                    class="${clabsPrefix}--chat-card-image"
                    src="${cardData.imageUrl}" />
                </div>` : type === 'video' ? html` <div class="${clabsPrefix}--chat-card-video-container">
                  <video controls>
                    <source src="${content}" type="video/webm" />
                  </video>
                </div>` : html``}

            <div
              class="${clabsPrefix}--chat-card-detail-container${type === 'video' ? '-video' : ''}">
              ${fileType && type === 'file' ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${fileType === 'mp3' ? html`${mp324()}` : fileType === 'mp4' ? html`${mp424()}` : fileType === 'png' ? html`${png24()}` : fileType === 'pdf' ? html`${pdf24()}` : fileType === 'ppt' ? html`${ppt24()}` : fileType === 'svg' ? html`${svg24()}` : fileType === 'xls' ? html`${xls24()}` : fileType === 'zip' ? html`${zip24()}` : fileType === 'wmv' ? html`${wmv24()}` : fileType === 'txt' ? html`${txt24()}` : fileType === 'tsv' ? html`${tsv24()}` : fileType === 'mov' ? html`${mov24()}` : fileType === 'jpg' ? html`${jpg24()}` : fileType === 'gif' ? html`${gif24()}` : fileType === 'csv' ? html`${csv24()}` : html`${documentBlank24()}`}
                  </div>` : html``}
              ${type === 'video' ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${videoPlayer24()}
                  </div>` : html``}
              ${fileType && type === 'audio' ? html`
                    ${fileType !== 'unknown' ? html` <div
                          class="${clabsPrefix}--chat-card-detail-side-icon">
                          ${fileType === 'mp3' ? html`${mp324()}` : fileType === 'wmv' ? html`${wmv24()}` : html`${music24()}`}
                        </div>` : html``}
                  ` : html``}

              <div
                class="${clabsPrefix}--chat-card-detail-side-content${type === 'video' ? '-video' : ''}">
                <div class="${clabsPrefix}--chat-card-detail-title">
                  ${cardData.title}
                </div>

                <div class="${clabsPrefix}--chat-card-detail-description">
                  ${cardData.description ? cardData.description : ''}
                </div>
                ${type !== 'audio' ? html`
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
                            ${ArrowRight16()}
                          </a>
                        </div>
                      </div>
                    ` : html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-audio-container">
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-item">
                          ${isAudioPlaying ? html` <cds-button
                                aria-label="Pause Audio File"
                                role="button"
                                kind="ghost"
                                size="sm"
                                @click="${toggleAudio}">
                                ${PauseFilled16({
    slot: 'icon'
  })}
                              </cds-button>` : html` <cds-button
                                kind="ghost"
                                aria-label="Play Audio File"
                                role="button"
                                size="sm"
                                @click="${toggleAudio}">
                                ${PlayFilledAlt16({
    slot: 'icon'
  })}
                              </cds-button>`}
                        </div>
                        <!-- <div class="${clabsPrefix}--chat-card-detail-audio-item">
                <cds-button aria-label="Mute Audio" role="button" kind="ghost" size="sm" disabled>
                  ${VolumeMute16({
    slot: 'icon'
  })}
                </cds-button>
                </div>-->
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-progress-bar">
                          <div
                            class="${clabsPrefix}--chat-card-detail-audio-progress"
                            style="width:${audioProgress / audioDuration * 100}%">
                            &nbsp;
                          </div>
                        </div>
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-timer">
                          ${formatAudioTime(audioProgress)}/${formatAudioTime(audioDuration)}
                        </div>
                      </div>
                      <audio
                        id="audio"
                        src="${cardData.link}"
                        @timeupdate="${updateAudioProgress}"
                        @loadedmetadata="${updateAudioDuration}"></audio>
                    `}
              </div>
            </div>` : html`${type === 'url' ? html` <div
                  class="${clabsPrefix}--chat-card-image-container"></div>` : type === 'video' ? html` <div
                  class="${clabsPrefix}--chat-card-video-container"></div>` : html``}

            <div
              class="${clabsPrefix}--chat-card-detail-container${type === 'video' ? '-video' : ''}">
              ${type === 'file' ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${documentBlank24()}
                  </div>` : html``}
              ${type === 'video' ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${videoPlayer24()}
                  </div>` : html``}
              ${type === 'audio' ? html` <div class="${clabsPrefix}--chat-card-detail-side-icon">
                    ${music24()}
                  </div>` : html``}

              <div
                class="${clabsPrefix}--chat-card-detail-side-content${type === 'video' ? '-video' : ''}">
                <div class="${clabsPrefix}--chat-card-detail-title">&nbsp;</div>

                <div class="${clabsPrefix}--chat-card-detail-description">
                  &nbsp;
                </div>
                ${type !== 'audio' ? html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-link-container">
                        <div
                          class="${clabsPrefix}--chat-card-detail-link-icon"></div>
                      </div>
                    ` : html`
                      <div
                        class="${clabsPrefix}--chat-card-detail-audio-container">
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-item">
                          ${isAudioPlaying ? html` <cds-button
                                aria-label="Pause Audio"
                                role="button"
                                kind="ghost"
                                disabled
                                size="sm">
                                ${PauseFilled16({
    slot: 'icon'
  })}
                              </cds-button>` : html` <cds-button
                                aria-label="Start Audio"
                                role="button"
                                kind="ghost"
                                disabled
                                size="sm">
                                ${PlayFilledAlt16({
    slot: 'icon'
  })}
                              </cds-button>`}
                        </div>
                        <div
                          class="${clabsPrefix}--chat-card-detail-audio-progress-bar">
                          <div
                            class="${clabsPrefix}--chat-card-detail-audio-progress"
                            style="width:0%">
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
//# sourceMappingURL=cardElement.template.js.map
