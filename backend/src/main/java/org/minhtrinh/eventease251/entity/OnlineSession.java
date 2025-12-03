package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "online_session")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumns({
    @PrimaryKeyJoinColumn(name = "session_id", referencedColumnName = "session_id"),
    @PrimaryKeyJoinColumn(name = "event_id", referencedColumnName = "event_id")
})
public class OnlineSession extends Session {
    @Column(name = "meeting_url")
    private String meetingUrl;

    @Column(name = "platform_name")
    private String platformName;
}