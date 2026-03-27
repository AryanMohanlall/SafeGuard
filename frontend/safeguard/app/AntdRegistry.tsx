'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type Entity from '@ant-design/cssinjs/es/Cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useRef<Entity | null>(null);
  if (!cache.current) {
    cache.current = createCache();
  }

  useServerInsertedHTML(() => (
    <style
      id="antd"
      dangerouslySetInnerHTML={{ __html: extractStyle(cache.current!, true) }}
    />
  ));

  return <StyleProvider cache={cache.current}>{children}</StyleProvider>;
}
