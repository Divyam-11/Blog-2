import {useState} from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const register =async (e)=>{
        e.preventDefault();
       const response = await fetch('http://localhost:4000/register',{
            method: 'POST',
            body: JSON.stringify({username,password}),
            headers: {'Content-type':'application/json'},
        })
        if(response.status === 200){
            alert('Registration Passed');
        }
        else {
            alert('registered failed')
        }
    }
    return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input type="text"
             value={username}
             onChange={e=>setUsername(e.target.value)}
             placeholder="username" />
      <input type="password"
             value={password}
             onChange={e=>setPassword(e.target.value)}
             placeholder="password" />
      <button>Register</button>
    </form>
  );
}
