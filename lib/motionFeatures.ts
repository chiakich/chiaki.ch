// Split point for framer-motion's dom animation features, so LazyMotion can
// pull them in as their own chunk instead of parking them in _app's critical
// path. See pages/_app.tsx.
export { domAnimation as default } from 'framer-motion'
