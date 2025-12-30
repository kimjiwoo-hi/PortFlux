/**
 * 이미지 캐싱 및 프리로드 유틸리티
 */

// 이미지 캐시 저장소
const imageCache = new Map();

/**
 * 이미지를 프리로드하고 캐시에 저장
 * @param {string} src - 이미지 URL
 * @returns {Promise<string>} 로드된 이미지 URL
 */
export const preloadImage = (src) => {
  if (!src || src.trim() === '') {
    return Promise.resolve(null);
  }

  // 이미 캐시에 있으면 즉시 반환
  if (imageCache.has(src)) {
    return Promise.resolve(src);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      imageCache.set(src, true);
      resolve(src);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
};

/**
 * 여러 이미지를 동시에 프리로드
 * @param {string[]} sources - 이미지 URL 배열
 * @returns {Promise<string[]>} 로드된 이미지 URL 배열
 */
export const preloadImages = (sources) => {
  const promises = sources
    .filter(src => src && src.trim() !== '')
    .map(src => preloadImage(src).catch(() => null));

  return Promise.all(promises);
};

/**
 * 캐시 확인
 * @param {string} src - 이미지 URL
 * @returns {boolean} 캐시 여부
 */
export const isCached = (src) => {
  return imageCache.has(src);
};

/**
 * 캐시 클리어
 */
export const clearCache = () => {
  imageCache.clear();
};
