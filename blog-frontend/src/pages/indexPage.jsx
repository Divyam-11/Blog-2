import Post from "../Components/post.jsx";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/post").then((res) => {
      res.json().then((posts) => {
        setPosts(posts);
        console.log(posts);
      });
    });
  }, []);
  // eslint-disable-next-line react/jsx-key
  return <>{posts.length > 0 && posts.map((post) => <Post {...post} />)}</>;
}
