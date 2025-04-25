// // userSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { updateOnlineUsers, updateUserStatus } from "./authSlice";
// import { OnlineUser } from "@/layout/LayoutTypes";


// interface UserState {
//   onlineUsers: OnlineUser[];
// }

// const initialState: UserState = {
//   onlineUsers: [],
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setOnlineUsers: (state, action: PayloadAction<OnlineUser[]>) => {
//       state.onlineUsers = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     // Cập nhật toàn bộ danh sách người dùng online
//     builder.addCase(updateOnlineUsers, (state, action) => {
//       state.onlineUsers = action.payload;
//       console.log(state.onlineUsers);
//     });
    
//     // Cập nhật trạng thái của một người dùng cụ thể
//     builder.addCase(updateUserStatus, (state, action) => {
//       const { userId, username, status } = action.payload;
//       const userIndex = state.onlineUsers.findIndex(user => user.id === userId);
//       if (status === 'online' && userIndex === -1) {
//         // Thêm user mới vào danh sách online nếu chưa có
//         state.onlineUsers.push({
//           id: userId,
//           name: action.payload.username || 'User',
//           username: action.payload.username || 'User',
//           status: 'online',
//           lastActive: new Date()
//         });
//       } else if (userIndex !== -1) {
//         if (status === 'offline') {
//           // Xóa user khỏi danh sách online
//           state.onlineUsers.splice(userIndex, 1);
//         } else {
//           // Cập nhật trạng thái
//           state.onlineUsers[userIndex].status = status;
//           state.onlineUsers[userIndex].lastActive = new Date();
//         }
//       }
//     });
//   },
// });
// export const { setOnlineUsers } = userSlice.actions;
// export default userSlice.reducer;