module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/store': './src/store',
            '@/services': './src/services',
            '@/database': './src/database',
            '@/styles': './src/styles',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/assets': './src/assets',
            '@/config': './src/config',
          },
        },
      ],
    ],
  };
};
