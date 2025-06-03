import { FC, useEffect, useState, useRef } from "react";
import { CommonChatBoxInterFace } from "../MessengerType";
import { ImagePath } from "../../../utils/constant";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import UserGallery from "./UserGallery";
import UserChat from "./UserChat";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatTimeAgo } from "@/utils/formatTime";
import GroupChatModal from './GroupChatModal';

import {
  searchMessages,
  getNickname,
  updateNickname,
  getGroupMembers,
} from "@/service/messageService";
import { Message } from "@/hooks/useSocket";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import { GroupMember } from "@/components/Messenger/MessengerType";


const CommonChatBox: FC<CommonChatBoxInterFace> = ({
  userList,
  setUserList,
  setActiveTab,
  onlineUsers,
  initialConversationId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [nicknames, setNicknames] = useState<{
    conversation_id: string;
    users: {
      id: string;
      nickname: string;
      first_name: string;
      last_name: string;
      avatar: string;
    }[];
  }>({
    conversation_id: "",
    users: [],
  });

  const { isModalOpen } = useSelector((state: RootState) => state.groupChat);

  const [newNickname, setNewNickname] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember>({
    conversation_id: "",
    members: [],
    member_count: 0,
    conversation_name: "",
    conversation_avatar: "",
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  const isGroupChat = userList?.type === "group";

  useEffect(() => {
    if (isGroupChat && initialConversationId) {
      getGroupMembers(initialConversationId).then((members) => {
        setGroupMembers(members);
      });
    }
  }, [isGroupChat, initialConversationId]);

  
  useEffect(() => {
    if (searchQuery.trim() && initialConversationId) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchMessages(
            initialConversationId,
            searchQuery.trim()
          );
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, initialConversationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearchResultClick = (message: Message) => {
    setMessagesOffset(message.offset || 0);
    setShowSearchResults(false);
    setSearchQuery("");
    setShowSearchInput(false);
  };

  const handleSearchIconClick = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          style={{ backgroundColor: "#ffeb3b", padding: "0 2px" }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const truncateMessage = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handleEditNickname = async () => {
    if (!initialConversationId || !userList?.other_user?.id) return;
    
    try {
      const currentUserNickname = await getNickname(initialConversationId);
      console.log(currentUserNickname, "currentUserNickname");
      setNicknames({
        conversation_id: currentUserNickname.conversation_id,
        users: currentUserNickname.users,
      });
      setShowNicknameModal(true);
    } catch (error) {
      console.error("Lỗi khi lấy biệt danh:", error);
    }
  };

  const handleEditGroupName = () => {
    console.log("Edit group name");
  };

  const handleEditGroupAvatar = () => {
    console.log("Edit group avatar");
  };

  const handleSaveNickname = async (targetUserId: string, newNickname: string, initialConversationId: string) => {
    if (!initialConversationId || !targetUserId) return;
    await updateNickname(initialConversationId, targetUserId, newNickname);
    setNicknames((prev) => ({
      ...prev,
      users: prev.users.some((u) => u.id === targetUserId)
        ? prev.users.map((u) => (u.id === targetUserId ? { ...u, nickname: newNickname } : u))
        : [...prev.users, { id: targetUserId, nickname: newNickname, first_name: "", last_name: "", avatar: "" }],
    }));
    setNewNickname("");
    setEditingUserId(null)
  };


  return (
    <div className="tab-box">
      <UserChat
        user={userList}
        setUserList={setUserList}
        setActiveTab={setActiveTab}
        onlineUsers={onlineUsers}
        initialConversationId={initialConversationId}
        messagesOffset={messagesOffset}
        showUserInfo={showUserInfo}
        setShowUserInfo={setShowUserInfo}
        groupMembers={groupMembers}
      />
      <div
        className={`user-info ${showUserInfo ? "active" : ""}`}
        style={{ display: showUserInfo ? "block" : "none" }}
      >
        <div
          className="back-btn d-lg-none d-block"
          onClick={() => router.push("/")}
        >
          <DynamicFeatherIcon iconName="X" className="icon-theme" />
        </div>

        <div
          className="user-image bg-size blur-up lazyloaded text-center"
          style={{ height: "auto" }}
        >
          <Image
            src={isGroupChat ? groupMembers?.conversation_avatar ? groupMembers?.conversation_avatar : groupMembers?.members[0]?.avatar : userList?.other_user?.avatar || `${ImagePath}/icon/user.png`}
            className="img-fluid lazyload bg-img rounded-circle"
            alt=""
            width={120}
            height={120}
          />
        </div>

        <div className="user-name">
          <h5>
            {isGroupChat ? (
              groupMembers.conversation_name
            ) : (
              <Link
                href={`/profile/timeline/${userList?.other_user?.username}`}
                target="_blank"
                style={{ color: "inherit" }}
              >
                {isGroupChat ? groupMembers.conversation_name : userList?.other_user?.nickname ? userList?.other_user?.nickname : userList?.other_user?.name}
              </Link>
            )}
          </h5>
        </div>

        <div
          className="action-icons"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            margin: "15px 0",
          }}
        >
          {!isGroupChat && (
          <div
            className="action-icon"
            onClick={() =>
              router.push(`/profile/timeline/${userList?.other_user?.username}`)
            }
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#e4e6ea";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#f0f2f5";
            }}
          >
            <DynamicFeatherIcon iconName="User" />
          </div>
          )}

          <div
            className="action-icon"
            onClick={handleSearchIconClick}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: showSearchInput ? "#1877f2" : "#f0f2f5",
              color: showSearchInput ? "white" : "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!showSearchInput) {
                (e.target as HTMLElement).style.backgroundColor = "#e4e6ea";
              }
            }}
            onMouseLeave={(e) => {
              if (!showSearchInput) {
                (e.target as HTMLElement).style.backgroundColor = "#f0f2f5";
              }
            }}
          >
            <DynamicFeatherIcon iconName="Search" />
          </div>
        </div>

        {showSearchInput && (
          <div
            className="message-search-container"
            style={{ margin: "20px 0", position: "relative" }}
            ref={searchContainerRef}
          >
            <div
              className="search-input-wrapper"
              style={{ position: "relative" }}
            >
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  border: "1px solid #e4e6ea",
                  borderRadius: "20px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#f8f9fa",
                  transition: "all 0.3s ease",
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                autoFocus
              />
              <div
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#65676b",
                }}
              >
                {isSearching ? (
                  <div
                    className="spinner"
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #e4e6ea",
                      borderTopColor: "#1877f2",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <DynamicFeatherIcon iconName="Search" />
                )}
              </div>
            </div>

            {showSearchResults && (
              <div
                className="search-results"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  backgroundColor: "white",
                  border: "1px solid #e4e6ea",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                  marginTop: "4px",
                }}
              >
                {searchResults.length > 0 ? (
                  <>
                    <div
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: "#65676b",
                        borderBottom: "1px solid #e4e6ea",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      Tìm thấy {searchResults.length} kết quả
                    </div>
                    {searchResults.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleSearchResultClick(message)}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f2f5",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor =
                            "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.4",
                            marginBottom: "4px",
                          }}
                        >
                          {message.type === "image" ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <DynamicFeatherIcon iconName="Image" />
                              <span
                                style={{
                                  fontStyle: "italic",
                                  color: "#65676b",
                                }}
                              >
                                Hình ảnh được gửi
                              </span>
                            </div>
                          ) : (
                            highlightSearchText(
                              truncateMessage(message.content),
                              searchQuery
                            )
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#65676b",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            {message.sender?.first_name +
                              " " +
                              message.sender?.last_name ||
                              message.sender?.username ||
                              "Unknown"}
                          </span>
                          <span>{formatTimeAgo(message.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchQuery.trim() && !isSearching ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#65676b",
                      fontSize: "14px",
                    }}
                  >
                    Không tìm thấy tin nhắn nào
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        <div className="dropdown-section" style={{ margin: "20px 0" }}>
          <div
            className="dropdown-header"
            onClick={() => setShowChatSettings(!showChatSettings)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#f8f9fa";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DynamicFeatherIcon iconName="Settings" />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Tùy chỉnh đoạn chat
              </span>
            </div>
            <DynamicFeatherIcon
              iconName={showChatSettings ? "ChevronUp" : "ChevronDown"}
            />
          </div>

          {showChatSettings && (
            <div
              className="dropdown-content"
              style={{
                backgroundColor: "white",
                border: "1px solid #e4e6ea",
                borderRadius: "8px",
                marginTop: "4px",
                overflow: "hidden",
              }}
            >
              <div
                className="dropdown-item"
                onClick={handleEditNickname}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  borderBottom: "1px solid #f0f2f5",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <DynamicFeatherIcon iconName="Edit3" />
                <span style={{ fontSize: "14px" }}>Chỉnh sửa biệt danh</span>
              </div>

              {isGroupChat && (
                <>
                  <div
                    className="dropdown-item"
                    onClick={handleEditGroupName}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      borderBottom: "1px solid #f0f2f5",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor =
                        "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <DynamicFeatherIcon iconName="Users" />
                    <span style={{ fontSize: "14px" }}>Chỉnh sửa tên nhóm</span>
                  </div>

                  <div
                    className="dropdown-item"
                    onClick={handleEditGroupAvatar}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor =
                        "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <DynamicFeatherIcon iconName="Image" />
                    <span style={{ fontSize: "14px" }}>Chỉnh sửa ảnh nhóm</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {isModalOpen && <GroupChatModal />}
        {showNicknameModal && (
          <div
            className="nickname-modal"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
            onClick={() => setShowNicknameModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                width: "90%",
                maxWidth: "400px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-center mb-3">Biệt danh</h2>
              {[user, userList?.other_user].map((targetUser, idx) => {
                if (!targetUser) return null;
                const nickname =
                  nicknames.users.find((u) => u.id === targetUser.id)
                    ?.nickname || "";
                const isEditing = editingUserId === targetUser.id;

                return (
                  <div key={targetUser.id} style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <img
                        src={targetUser.avatar || `${ImagePath}/icon/user.png`}
                        alt="avatar"
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        {isEditing ? (
                          <>
                            <div style={{ fontSize: "13px", color: "#65676b" }}>
                              {targetUser.name}
                            </div>
                            <input
                              type="text"
                              value={newNickname}
                              onChange={(e) => setNewNickname(e.target.value)}
                              placeholder="Nhập biệt danh..."
                              autoFocus
                              style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                fontSize: "14px",
                                marginBottom: "4px",
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: "13px", color: "#65676b" }}>
                              {targetUser.name}
                            </div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "15px",
                                marginBottom: "4px",
                              }}
                            >
                              {nickname || "Chưa đặt biệt danh"}
                            </div>
                          </>
                        )}
                      </div>

                      {isEditing ? (
                        <DynamicFeatherIcon
                          iconName="Check"
                          onClick={() => handleSaveNickname(targetUser.id, newNickname, initialConversationId || "")}
                        />
                      ) : (
                        <DynamicFeatherIcon
                          iconName="Edit2"
                          onClick={() => {
                            setEditingUserId(targetUser.id);
                            setNewNickname(nickname);
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isGroupChat && (
          <div className="dropdown-section" style={{ margin: "20px 0" }}>
            <div
              className="dropdown-header"
              onClick={() => setShowMembers(!showMembers)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#e4e6ea";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#f8f9fa";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <DynamicFeatherIcon iconName="Users" />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Thành viên nhóm ({groupMembers.member_count})
                </span>
              </div>
              <DynamicFeatherIcon
                iconName={showMembers ? "ChevronUp" : "ChevronDown"}
              />
            </div>

            {showMembers && (
              <div
                className="dropdown-content"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e4e6ea",
                  borderRadius: "8px",
                  marginTop: "4px",
                  overflow: "hidden",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {groupMembers.members.map((m: GroupMember["members"][0], index: number) => (
                  <div
                    key={m.id}
                    className="member-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      borderBottom:
                        index < groupMembers.members.length - 1
                          ? "1px solid #f0f2f5"
                          : "none",
                    }}
                    onClick={() =>
                      router.push(`/profile/timeline/${m.username}`)
                    }
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor =
                        "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <Image
                      src={m.avatar || `${ImagePath}/icon/user.png`}
                      alt={m.name}
                      width={32}
                      height={32}
                      style={{ borderRadius: "50%" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "500" }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#65676b" }}>
                        @{m.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <UserGallery conversationId={initialConversationId || ""} />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .search-results::-webkit-scrollbar,
        .dropdown-content::-webkit-scrollbar {
          width: 6px;
        }

        .search-results::-webkit-scrollbar-track,
        .dropdown-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .search-results::-webkit-scrollbar-thumb,
        .dropdown-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .search-results::-webkit-scrollbar-thumb:hover,
        .dropdown-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        @media (max-width: 991px) {
          .user-info.active {
            right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CommonChatBox;
