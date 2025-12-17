package com.portflux.backend.service;

import com.portflux.backend.beans.BoardFreeBean;
import com.portflux.backend.dao.BoardFreeDao; // 위에서 만든 DAO import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardFreeService {

    @Autowired
    private BoardFreeDao boardFreeDao; // 이름 일치 (BoardFreeDao)

    public List<BoardFreeBean> getBoardList() {
        return boardFreeDao.getBoardList();
    }

    public void writeBoard(BoardFreeBean boardFreeBean) {
        boardFreeDao.insertBoard(boardFreeBean);
    }
    
    public BoardFreeBean getBoardDetail(int postId) {
        boardFreeDao.increaseViewCount(postId);
        return boardFreeDao.getBoardDetail(postId);
    }
    
    public void updateBoard(BoardFreeBean boardFreeBean) {
        boardFreeDao.updateBoard(boardFreeBean);
    }
    
    public void deleteBoard(int postId) {
        boardFreeDao.deleteBoard(postId);
    }
}