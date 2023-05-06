import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MUITooltip from '../components/muiTooltip';

const Page=styled.div`
width: 100%;
min-height: 650px;
background-color: #121212;
padding: 100px 0;
`;

const StyledTable=styled.table`
width: 80%;
background-color: rgba(132, 136, 132, 0.1);
margin: auto;
border-bottom-left-radius: 15px;
border-bottom-right-radius: 15px;
`;

const FirstRow=styled.tr`
background-color: rgba(55, 255, 20, 0.5);
`;

const Data=styled.td`
color: rgba(132, 136, 132);
padding: 7px
`;

const Row=styled.tr`
&:hover{
    background-color: rgba(132, 136, 132, 0.2);
    cursor: pointer;
    ${Data}{
        color: whitesmoke;
    }
}
`;

const Heading=styled.th`
color: #121212;
padding: 8px;
`;

const Button=styled.button`
background: none;
border: none;
color: #A52A2A;
font-size: 15px;
border-radius: 40px;
padding: 5px;
position: relative;
top: 3px;
left: 10px;
cursor: pointer;
transition: 0.5s;
&:hover{
    transform: scale(1.3);
}
`;


export default function Users() {

    const [users, setUsers] = useState([]);

    const navigate=useNavigate();

    const getUsers = async () => {
        try {
            const res=await axios.get("http://localhost:3000/users", {headers: {"Authorization": `Bearer ${localStorage.getItem("accessToken")}`}})
            setUsers(res.data);
            console.log(res.data);
        } catch (error) {
            console.log(error.data)
        }
    }

    const getUser = (user) => {
        navigate(`/users/${user.userId}`)
    }

    const updateUser = (user) => {
        navigate(`/users/${user.userId}/update`)
    }

    const deleteUser = async (user) =>{
        try {
            const res=await axios.delete(`http://localhost:3000/users/${user.userId}`)
            console.log(res)
            setUsers(
                users.filter(oldUser=>oldUser.userId!=user.userId)
            )
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getUsers()
      }, [])

  return (
    <Page>
        <StyledTable>
        <tbody>
        <FirstRow>
            <Heading style={{borderTopLeftRadius: "20px"}}>User Id</Heading>
            <Heading>First Name</Heading>
            <Heading>Last Name</Heading>
            <Heading>Age</Heading>
            <Heading>Gender</Heading>
            <Heading>Phone</Heading>
            <Heading>Email</Heading>
            <Heading>Role</Heading>
            <Heading></Heading>
            <Heading></Heading>
        </FirstRow>
        </tbody>
        {
            users.length > 0 && 
            users.map((user) => {
                return(
                    <tbody key={user.userId}>
                    <Row>
                        <Data onClick={()=>getUser(user)}>{user.userId}</Data>
                        <Data onClick={()=>getUser(user)}>{user.firstName}</Data>
                        <Data onClick={()=>getUser(user)}>{user.lastName}</Data>
                        <Data onClick={()=>getUser(user)}>{user.age}</Data>
                        <Data onClick={()=>getUser(user)}>{user.gender}</Data>
                        <Data onClick={()=>getUser(user)}>{user.phone}</Data>
                        <Data onClick={()=>getUser(user)}>{user.email}</Data>
                        <Data onClick={()=>getUser(user)}>{user.role}</Data>
                        <Data><MUITooltip icon="edit" color="primary" title="Edit user." onClick={()=>updateUser(user)}/></Data>
                        <Data><MUITooltip icon="delete" color="error" title="Delete user." onClick={()=>deleteUser(user)}/></Data>
                    </Row>
                    </tbody>
                );
            })
        }
        </StyledTable>
    </Page>
  )
}
