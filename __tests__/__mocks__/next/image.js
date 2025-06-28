// Next.jsのImageコンポーネントをモック
import React from 'react';

// Next.jsのImageコンポーネントをシンプルなimgタグとしてモック化
function NextImage({ src, alt, width, height, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
}

// デフォルトエクスポートとしてNextImageを設定
export default NextImage; 