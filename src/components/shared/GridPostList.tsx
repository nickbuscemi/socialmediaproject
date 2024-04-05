import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";


type GridPostListProps = {
    posts: Models.Document[] | undefined;
    showUser?: boolean;
    showStats?: boolean;
    showPicture?: boolean;
}

const GridPostList = ({ posts, showUser = true, showPicture = true, showStats = true }: GridPostListProps) => {

  const { user } = useUserContext();

  return (
    <ul className="grid-container">
        {posts?.map((post) => (
            <li key={post.$id} className="relative w-18 h-18 lg:w-50 lg:h-50">
                <Link to={`/posts/${post.$id}`} className="grid-post_link">
                    <img src={post.imageUrl} alt="post" className="h-full w-full object-cover"/>
                </Link>
                <div className="grid-post_user">
                    {showPicture && (
                        <div className="flex flex-1 gap-2 items-center ">
                            <img 
                                src={post.creator.imageUrl} 
                                alt="creator"
                                className="w-4 h-4 lg:w-8 lg:h-8 rounded-full"
                            />
                            
                        </div> 
                    )}
                    {showUser && (
                        <p className="line-clamp-1">@{post.creator.username}</p>
                    )}
                    {showStats && <PostStats post={post} userId={user.id} />}
                </div>
            </li>
        ))}
    </ul>
  )
}

export default GridPostList