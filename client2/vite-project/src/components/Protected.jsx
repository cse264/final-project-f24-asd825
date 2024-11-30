import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Center} from '@mantine/core';
import Demo from './MovieSlider';
import WatchList from './WatchList';

const Protected = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
    <Center>
        <Container   style={{ borderRadius: '16px', padding: '10px', backgroundColor: '#141517', margin: '10px' }}>   
             <Demo/>
        </Container>
    </Center>
    <Center>
    <Container  style={{ borderRadius: '16px', padding: '10px', backgroundColor: '#141517', margin: '10px' }}>   
        <WatchList></WatchList>
    </Container>
    </Center>
        
    </>
  );
};

export default Protected;
