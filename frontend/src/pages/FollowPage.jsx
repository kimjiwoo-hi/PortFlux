/*
import React, { useState, useEffect, useCallback } from 'react';
import { getFollowing, getFollowers, follow, unfollow } from '../api/api';
import './FollowPage.css';

const FollowPage = () => {
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [activeTab, setActiveTab] = useState('following');
    
    // TODO: 실제 애플리케이션에서는 이 값을 인증 컨텍스트나 전역 상태로부터 가져와야 합니다.
    const currentUserId = 1; 

    const fetchData = useCallback(async () => {
        try {
            // 팔로잉/팔로워 목록을 모두 가져와서 UI 버튼 상태를 정확하게 표시합니다.
            const [followingRes, followersRes] = await Promise.all([
                getFollowing(currentUserId),
                getFollowers(currentUserId)
            ]);
            setFollowing(followingRes.data);
            setFollowers(followersRes.data);
        } catch (error) {
            console.error("Failed to fetch follow data:", error);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFollow = async (userIdToFollow) => {
        // 낙관적 업데이트: UI를 먼저 변경
        setFollowing(prev => [...prev, userIdToFollow]);
        try {
            await follow(currentUserId, userIdToFollow);
        } catch (error) {
            console.error(`Failed to follow user ${userIdToFollow}:`, error);
            // 에러 발생 시 롤백
            setFollowing(prev => prev.filter(id => id !== userIdToFollow));
        }
    };

    const handleUnfollow = async (userIdToUnfollow) => {
        // 낙관적 업데이트: UI를 먼저 변경
        setFollowing(prev => prev.filter(id => id !== userIdToUnfollow));
        try {
            await unfollow(currentUserId, userIdToUnfollow);
        } catch (error) {
            console.error(`Failed to unfollow user ${userIdToUnfollow}:`, error);
            // 에러 발생 시 롤백
            setFollowing(prev => [...prev, userIdToUnfollow]);
        }
    };

    const UserList = ({ users, title }) => (
        <div>
            <h3>{title} ({users.length})</h3>
            <ul>
                {users.map(userId => (
                    <li key={userId}>
                        User ID: {userId}
                        {userId !== currentUserId && ( // 자기 자신에게는 버튼 숨김
                            following.includes(userId) ? (
                                <button onClick={() => handleUnfollow(userId)}>Unfollow</button>
                            ) : (
                                <button onClick={() => handleFollow(userId)}>Follow</button>
                            )
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="follow-page">
            <div className="tabs">
                <button onClick={() => setActiveTab('following')} className={activeTab === 'following' ? 'active' : ''}>Following</button>
                <button onClick={() => setActiveTab('followers')} className={activeTab === 'followers' ? 'active' : ''}>Followers</button>
            </div>
            <div className="content">
                {activeTab === 'following' ? (
                    <UserList users={following} title="Following" />
                ) : (
                    <UserList users={followers} title="Followers" />
                )}
            </div>
        </div>
    );
};

export default FollowPage;
*/

import React from 'react'; // React만 필요
import './FollowPage.css'; // 기존 CSS는 유지

const FollowPage = () => {
    return (
        <div className="follow-page" style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#555' }}>
            <h2>팔로우 페이지</h2>
            <p>팔로우 기능은 현재 준비 중입니다. 원본 코드는 파일 내 주석 처리되어 있습니다.</p>
            <p>불편을 드려 죄송합니다.</p>
        </div>
    );
};

export default FollowPage;