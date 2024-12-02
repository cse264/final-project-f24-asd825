import { Container, SimpleGrid, Text, TextInput, Button, Group, Title, Paper } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
  // State for user profile data and form state
  const [userProfile, setUserProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile');
        setUserProfile(response.data); // Set the profile data
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Handle save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const response = await axios.put('http://localhost:5000/profile', userProfile);
      setUserProfile(response.data); // Update the profile with saved data
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }

    setIsSaving(false);
  };

  return (
    <Container
      style={{
        maxWidth: '600px',
        padding: '40px',
        backgroundColor: '#1a1b1e',
        marginTop: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Title align="center" style={{ color: '#fff', marginBottom: '20px' }}>
        My Profile
      </Title>

      <Paper
        radius="md"
        style={{
          padding: '30px',
          backgroundColor: '#222529',
          marginBottom: '20px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <SimpleGrid cols={1} spacing="lg">
          {/* Editable Fields for First Name, Last Name, and Email */}
          <div style={{ marginBottom: '20px' }}>
            <Text
              size="lg"
              weight={500}
              style={{
                color: '#fff',
                marginBottom: '10px',
              }}
            >
              First Name
            </Text>
            {isEditing ? (
              <TextInput
                placeholder="Enter your first name"
                value={userProfile.first_name}
                onChange={(e) => setUserProfile({ ...userProfile, first_name: e.target.value })}
                style={{ marginBottom: '10px' }}
                radius="md"
              />
            ) : (
              <Text size="md" color="dimmed">
                {userProfile.first_name}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Text
              size="lg"
              weight={500}
              style={{
                color: '#fff',
                marginBottom: '10px',
              }}
            >
              Last Name
            </Text>
            {isEditing ? (
              <TextInput
                placeholder="Enter your last name"
                value={userProfile.last_name}
                onChange={(e) => setUserProfile({ ...userProfile, last_name: e.target.value })}
                style={{ marginBottom: '10px' }}
                radius="md"
              />
            ) : (
              <Text size="md" color="dimmed">
                {userProfile.last_name}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <Text
              size="lg"
              weight={500}
              style={{
                color: '#fff',
                marginBottom: '10px',
              }}
            >
              Email Address
            </Text>
            {isEditing ? (
              <TextInput
                placeholder="Enter your email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                style={{ marginBottom: '10px' }}
                radius="md"
              />
            ) : (
              <Text size="md" color="dimmed">
                {userProfile.email}
              </Text>
            )}
          </div>

          {/* Edit/Save Buttons */}
          <Group position="center">
            {isEditing ? (
              <Button
                onClick={handleSaveProfile}
                loading={isSaving}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  marginTop: '20px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                }}
              >
                Save Profile
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  marginTop: '20px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                }}
              >
                Edit Profile
              </Button>
            )}
          </Group>
        </SimpleGrid>
      </Paper>
    </Container>
  );
}

export default ProfilePage;
