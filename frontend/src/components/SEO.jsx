import React from 'react';
import { useEffect } from 'react';
import { SEO_DEFAULTS } from '../utils/constants';

/**
 * SEO — updates document title and meta description on route change.
 * @param {{ title?: string, description?: string, keywords?: string }} props
 */
const SEO = ({ title, description, keywords }) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SEO_DEFAULTS.title.split('–')[0].trim()}`
      : SEO_DEFAULTS.title;
    document.title = fullTitle;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description || SEO_DEFAULTS.description;

    // Meta keywords
    let metaKw = document.querySelector('meta[name="keywords"]');
    if (!metaKw) {
      metaKw = document.createElement('meta');
      metaKw.name = 'keywords';
      document.head.appendChild(metaKw);
    }
    metaKw.content = keywords || SEO_DEFAULTS.keywords;
  }, [title, description, keywords]);

  return null;
};

export default SEO;
