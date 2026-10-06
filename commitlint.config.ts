import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // scope é obrigatório: feat(hero): add cta
    'scope-empty': [2, 'never'],
    // scopes permitidos no projeto
    'scope-enum': [
      2,
      'always',
      [
        'hero',
        'services',
        'about',
        'gallery',
        'location',
        'header',
        'footer',
        'nav',
        'cta',
        'ui',
        'data',
        'types',
        'lib',
        'seo',
        'config',
        'ci',
        'tests',
        'deps',
        // fullstack
        'db',
        'auth',
        'admin',
        'shop',
        'cart',
        'storage',
        'api',
      ],
    ],
  },
}

export default config
