import { create } from "twrnc";

export const theme = {
  content: ["./src/navigation/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        'abril': 'AbrilFatface-Regular',
        'dm': 'DMSans'
      },
      
      colors: {
        transparent: 'transparent',
        black: '#000',
        white: '#fff',
        gray: {
          100: '#f7fafc',
          // ...
          900: '#1a202c',
        },
      }
    },
    
  }
};

const tw = create(theme);

export default tw;
