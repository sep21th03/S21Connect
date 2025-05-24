import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { Story } from "@/Common/CommonInterFace";

export async function createStory(story: Story) {
    const response = await axiosInstance.post(API_ENDPOINTS.STORIES.CREATE, story);
    return response.data;
}

export async function getStories() {
    const response = await axiosInstance.get(API_ENDPOINTS.STORIES.GET_STORIES);
    return response.data.stories;
}

export async function markStoryAsSeen(storyId: string) {
    const response = await axiosInstance.post(API_ENDPOINTS.STORIES.MARK_AS_SEEN, {
        story_id: storyId,
      });
      return response.data;
}



