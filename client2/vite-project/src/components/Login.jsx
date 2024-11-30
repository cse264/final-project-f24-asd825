import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Stack, Container } from '@mantine/core';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      logout();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
        console.log(123)
      navigate('/protected');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" mb="lg">
        Welcome Back
      </Title>
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
