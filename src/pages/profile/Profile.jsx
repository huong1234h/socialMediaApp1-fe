import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { makeRequest } from "../../axios";
import CurrentPost from "../../components/currentPost/CurrentPost";
import Posts from "../../components/posts/Posts";
import StoryForm from "../../components/storyForm/StoryForm";
import Update from "../../components/update/Update";
import { AuthContext } from "../../context/authContext";
import "./profile.scss";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [requestedChat,setRequestedChat] = useState(null);
  const [createdConversation,setCreatedConversation] = useState(false);
  const [openForm,setOpenForm] = useState(false);
  const { currentUser } = useContext(AuthContext);
  
  const userId = parseInt(useLocation().pathname.split("/")[2]);
  console.log("profileUserId: ",userId);
  const { isLoading, error, data: userData } = useQuery(["user",userId], () =>
    makeRequest.get("/users/find/" + userId).then((res) => res.data)
  );

  const { isLoading: userPostsLoading, error: userPostsError, data: userPostsData } = useQuery(
    ["userPosts",userId],
    () => makeRequest.get(`/posts/${userId}`).then((res) => res.data)
  );

  const handleAccessChat = async () => {
    try {
      const res = await axios.post(process.env.REACT_APP_BACKEND_URL + `conversations/add`,{
        att1Id:currentUser?.id,
        att2Id : userId,
      });
      setRequestedChat(res.data);
      setCreatedConversation(true);
      
    } catch (err) {
      setCreatedConversation(false);
    }
  };

  const { isLoading: isRelationshipLoading, error: relationshipError, data: relationshipData } = useQuery(
    ["relationship",userId],
    () =>
      makeRequest.get("/relationships?followedUserId=" + userId).then((res) => res.data)
  );

  const { isLoading: isNRelationshipLoading, error: nRelationshipError, data: nRelationshipData } = useQuery(
    ["nRelationship",userId],
    () =>
      makeRequest.get(`/relationships/numberFd/${userId}`).then((res) => res.data)
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (following) =>
      following
        ? makeRequest.delete("/relationships?userId=" + userId)
        : makeRequest.post("/relationships", { userId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["relationship"]);
      },
    }
  );

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser.id));
  };

  return (
    <div className="profile">
      {isLoading ? (
        "Đang tải..."
      ) : (
        <>
          <div className="images">
            <img src={userData?.coverPic} alt="" className="cover" />
          </div>

          <div className="profileContainer">
            <div className="uInfo">
              <div className="profilePic">
                <img src={userData?.profilePic} alt="" className="profilePic" />
              </div>

              <div className="center">
                <div className="userName">{userData?.name}
                  <span className="location">Live in {userData?.city}</span>
                </div>
                <div className="info">
                  <div className="item">
                    Theo dõi
                    <span>{nRelationshipData?.length}</span>
                  </div>
                  <div className="item">
                    Đang theo dõi
                    <span>{relationshipData?.length}</span>
                  </div>
                  <div className="item">
                    Bài viết
                    <span>
                      {userPostsLoading ? (
                        "..."
                      ) : userPostsError ? (
                        "Error Loading"
                      ) : userPostsData ? (
                        userPostsData?.length // Assuming 'length' property holds number of posts
                      ) : (
                        "No posts yet"
                      )}
                    </span>
                  </div>
                </div>
                <div className="button-profile">
                  {isRelationshipLoading ? (
                    "Đang tải..."
                  ) : userId === currentUser.id ? (
                    <>
                      <button className="update-btn" onClick={() => setOpenUpdate(true)}>Cập nhật</button>
                      <button className="create-story" onClick={()=>{setOpenForm(!openForm)}}>Tạo tin</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleFollow}>
                        {relationshipData.includes(currentUser.id)
                          ? "Đang theo dõi"
                          : "Theo dõi"}
                      </button>
                      <button className="chat" onClick={handleAccessChat}>Nhắn tin</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <CurrentPost userId={userId}/>
            <Posts userId={userId} />
          </div>
        </>
      )}
      {openForm && <StoryForm onHidden={()=>{setOpenForm(!openForm)}} setOpenForm={setOpenForm} openForm={openForm}/>}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={userData} />}
      {createdConversation === true && <Navigate to="/messenger" replace={true} state={{requestedChat:requestedChat}}/>}
    </div>
  );
};

export default Profile;
