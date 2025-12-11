import React, { useState, useEffect } from 'react';
import { getFollowing, getFollowers, follow, unfollow } from '../api/api';
import './FollowPage.css';

const FollowPage = () => {
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [activeTab, setActiveTab] = useState('following');
    const currentUserId = 1; // Hardcoded for now

    useEffect(() => {
        const fetchData = async () => {
            if (activeTab === 'following') {
                const followingData = await getFollowing(currentUserId);
                setFollowing(followingData.data);
            } else {
                const followersData = await getFollowers(currentUserId);
                setFollowers(followersData.data);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleFollow = async (userIdToFollow) => {
        await follow(currentUserId, userIdToFollow);
        // Refresh list
        const followingData = await getFollowing(currentUserId);
        setFollowing(followingData.data);
    };

    const handleUnfollow = async (userIdToUnfollow) => {
        await unfollow(currentUserId, userIdToUnfollow);
        // Refresh list
        const followingData = await getFollowing(currentUserId);
        setFollowing(followingData.data);
    };

    const UserList = ({ users, onFollow, onUnfollow, isFollowingList }) => (
        <ul>
            {users.map(user => (
                <li key={user}>
                    User ID: {user}
                    {isFollowingList ? (
                        <button onClick={() => onUnfollow(user)}>Unfollow</button>
                    ) : (
                        <button onClick={() => onFollow(user)}>Follow</button>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="follow-page">
            <div className="tabs">
                <button onClick={() => setActiveTab('following')} className={activeTab === 'following' ? 'active' : ''}>Following</button>
                <button onClick={() => setActiveTab('followers')} className={activeTab === 'followers' ? 'active' : ''}>Followers</button>
            </div>
            <div className="content">
                {activeTab === 'following' ? (
                    <UserList users={following} onUnfollow={handleUnfollow} isFollowingList={true} />
                ) : (
                    <UserList users={followers} onFollow={handleFollow} isFollowingList={false} />
                )}
            </div>
        </div>
    );
};

export default FollowPage;
