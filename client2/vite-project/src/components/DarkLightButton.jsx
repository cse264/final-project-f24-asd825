import React, {useContext} from 'react';
import { ActionIcon } from '@mantine/core';
import { Icon } from '@iconify/react'
import ColorSchemeContext from '../ColorSchemeContext';

function DarkLightButton() {
  const colorSchemeContext = useContext(ColorSchemeContext);
  const dark = colorSchemeContext.colorScheme === 'dark';
  console.log(dark)

  return (
    <ActionIcon
      variant="outline"
      color={dark ? 'yellow' : 'blue'}
      onClick={() => colorSchemeContext.onChange(dark ? 'light' : 'dark')}
      title="Toggle color scheme"
    >
      {dark ? (
        <Icon
        icon='material-symbols:check-circle-outline'
        fontSize='25px'
      />
      ) : (
        <Icon
  icon='material-symbols:check-circle-outline'
  fontSize='25px'
/>
      )}
    </ActionIcon>
  );
}

export default DarkLightButton
