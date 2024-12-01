import React, { useState, useEffect } from 'react';
import { Table, TextInput, Button, Group, Select, Container, Paper, Title } from '@mantine/core';
import axios from 'axios';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/admin/users', { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = async (userId, updatedUser) => {
    try {
      await axios.put(`/admin/users/${userId}`, updatedUser, { withCredentials: true });
      // Re-fetch users after update
      const response = await axios.get('/admin/users', { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`, { withCredentials: true });
      // Remove the deleted user from the state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <Container>
      <Title align="center" mb="md">
        Admin User Management
      </Title>
      <Paper padding="lg" shadow="md">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>First Name</Table.Th>
                <Table.Th>Last Name</Table.Th>
                <Table.Th>User Type</Table.Th>
                <Table.Th>Actions</Table.Th>
                <Table.Th>Delete</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <tbody>
              {users.map(user => (
                <Table.Tr key={user.id}>
                  <Table.Td>{user.id}</Table.Td>
                  <Table.Td>
                    <TextInput
                      value={user.email}
                      onChange={(e) => {
                        const newUsers = [...users];
                        const index = newUsers.findIndex(u => u.id === user.id);
                        newUsers[index].email = e.target.value;
                        setUsers(newUsers);
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      value={user.first_name}
                      onChange={(e) => {
                        const newUsers = [...users];
                        const index = newUsers.findIndex(u => u.id === user.id);
                        newUsers[index].first_name = e.target.value;
                        setUsers(newUsers);
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      value={user.last_name}
                      onChange={(e) => {
                        const newUsers = [...users];
                        const index = newUsers.findIndex(u => u.id === user.id);
                        newUsers[index].last_name = e.target.value;
                        setUsers(newUsers);
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      value={user.user_type}
                      onChange={(value) => {
                        const newUsers = [...users];
                        const index = newUsers.findIndex(u => u.id === user.id);
                        newUsers[index].user_type = value;
                        setUsers(newUsers);
                      }}
                      data={['admin', 'user']}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <Button onClick={() => handleUpdate(user.id, user)}>Save</Button>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <Button color="red" onClick={() => handleDelete(user.id)}>Delete</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPage;

