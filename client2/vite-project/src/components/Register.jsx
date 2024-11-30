import React, { useState } from 'react';
import axios from 'axios';
import { TextInput, PasswordInput, Button, Paper, Title, Stack, Container } from '@mantine/core';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/register', { first_name: firstName, last_name: lastName, email, password });
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" mb="lg">
        Create an Account
      </Title>
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextInput
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
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
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;
