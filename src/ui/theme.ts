import { extendTheme } from '@chakra-ui/react';

const xl = {
  fontSize: '2xl',
  pl: 5,
  pr: 5,
  h: 14,
  borderRadius: 'md',
};

export const theme = extendTheme({
  components: {
    IconButton: {
      variants: {
        rainbow: {
          fontWeight: 'bold',
          backgroundColor: '#fff',
          backgroundClip: 'padding-box',
          _before: {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: 0,
            bottom: 0,
            opacity: 0.8,
            height: 'calc(100% + 4px)',
            width: 'calc(100% + 4px)',
            backgroundImage:
              'linear-gradient(110deg, #e1f549, #29d0be, #6cb8ea, #ff5959)',
            zIndex: -1,
            borderRadius: '0.375rem',
            margin: '-2px',
          },
          _hover: {
            backgroundColor: 'transparent',
            color: '#fff',
          },
        },
      },
    },
    Button: {
      variants: {
        rainbow: {
          fontWeight: 'bold',
          backgroundColor: '#fff',
          backgroundClip: 'padding-box',
          _before: {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: 0,
            bottom: 0,
            opacity: 0.8,
            height: 'calc(100% + 4px)',
            width: 'calc(100% + 4px)',
            backgroundImage:
              'linear-gradient(110deg, #e1f549, #29d0be, #6cb8ea, #ff5959)',
            zIndex: -1,
            borderRadius: '0.375rem',
            margin: '-2px',
          },
          _hover: {
            backgroundColor: 'transparent',
            color: '#fff',
          },
        },
      },
    },
    Input: {
      sizes: {
        xl: {
          field: xl,
          addon: xl,
        },
      },
    },
    Link: {
      baseStyle: {
        fontWeight: 'bold',
        textDecoration: 'underline',
        _hover: {
          color: '#29d0be',
        },
      },
      variants: {
        basic: {
          textDecoration: 'none',
        },
      },
    },
  },
});
