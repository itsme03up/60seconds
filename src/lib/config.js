// スライドショー設定
export const SLIDESHOW_CONFIG = {
  // デフォルト設定 (60秒)
  default: {
    totalSeconds: 60,
    segments: [
      { key: 'point', title: 'Point（要点・結論）', seconds: 15 },
      { key: 'reason', title: 'Reason（理由・根拠）', seconds: 15 },
      { key: 'example', title: 'Example（具体例・事例）', seconds: 15 },
      { key: 'summary', title: 'Summary（まとめ）', seconds: 15 }
    ]
  },
  
  // 90秒バージョン (将来対応)
  extended: {
    totalSeconds: 90,
    segments: [
      { key: 'point', title: 'Point（要点・結論）', seconds: 20 },
      { key: 'reason', title: 'Reason（理由・根拠）', seconds: 25 },
      { key: 'example', title: 'Example（具体例・事例）', seconds: 25 },
      { key: 'summary', title: 'Summary（まとめ）', seconds: 20 }
    ]
  },
  
  // 2分バージョン (将来対応)
  long: {
    totalSeconds: 120,
    segments: [
      { key: 'point', title: 'Point（要点・結論）', seconds: 30 },
      { key: 'reason', title: 'Reason（理由・根拠）', seconds: 30 },
      { key: 'example', title: 'Example（具体例・事例）', seconds: 30 },
      { key: 'summary', title: 'Summary（まとめ）', seconds: 30 }
    ]
  }
}

// 現在の設定を取得
export const getCurrentConfig = (configKey = 'default') => {
  return SLIDESHOW_CONFIG[configKey] || SLIDESHOW_CONFIG.default
}

// 設定に基づいてスライドデータを生成
export const generateSlides = (prepData, configKey = 'default') => {
  const config = getCurrentConfig(configKey)
  
  return config.segments.map(segment => ({
    type: 'slide',
    key: segment.key,
    title: segment.title,
    content: prepData[segment.key] || '',
    duration: segment.seconds,
    layout: segment.key === 'example' ? 'bottom' : 'default',
    referenceLink: segment.key === 'example' ? prepData.referenceLink : undefined
  }))
}
