import { User } from '../types';
import { deleteUser as deleteUserFromAuth, getUsers, saveUsers } from './userService';
import { deleteHistoryForUser } from './historyService';
import { deleteSettingsForUser } from './settingsService';
import { deleteSmilePlanForUser } from './planService';
import { deleteChatHistoryForUser } from './chatService';

export const getChildrenForParent = (parentId: string): User[] => {
    const allUsers = getUsers();
    const parentUser = allUsers[parentId];

    if (!parentUser || parentUser.role !== 'parent' || !parentUser.childIds) {
        return [];
    }
    
    return parentUser.childIds
        .map(childId => allUsers[childId])
        .filter((child): child is User => Boolean(child));
};

export const removeChild = (parent: User, childId: string): User => {
    if(!childId) throw new Error("Child ID is required for deletion.");
    
    // Delete all associated data
    deleteUserFromAuth(childId);
    deleteHistoryForUser(childId);
    deleteSettingsForUser(childId);
    deleteSmilePlanForUser(childId);
    deleteChatHistoryForUser(childId);

    // Update parent's child list
    const users = getUsers();
    const updatedParent: User = {
        ...parent,
        childIds: parent.childIds?.filter(id => id !== childId)
    };
    users[parent.id] = updatedParent;
    saveUsers(users);

    return updatedParent;
}